// ═══════════════════════════════════════════════════════════════════
// routes/deliveryRoutes.js
// PROTOTYPE MODE: simulate delivery steps manually
// REAL MODE: set PROTOTYPE_MODE=false → uses Shiprocket API
//
// STATUS FLOW:
// Processing → Confirmed → Shipped → Out for Delivery → Delivered
//
// HOW TO GO LIVE (after testing):
// 1. Set PROTOTYPE_MODE=false in .env
// 2. Set SHIPROCKET_EMAIL + SHIPROCKET_PASSWORD in .env
// 3. Set SHIPROCKET_WEBHOOK_TOKEN in .env
// 4. In Shiprocket dashboard → Webhooks → set URL to:
//    https://yourdomain.com/api/delivery/webhook
// ═══════════════════════════════════════════════════════════════════
const notifyUser = require('../utils/notifyUser');
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, admin, seller } = require('../middleware/auth');

const PROTOTYPE_MODE = process.env.PROTOTYPE_MODE !== 'false';

const STATUS_FLOW = [
  'Processing',
  'Confirmed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

const getShiprocket = () => {
  if (PROTOTYPE_MODE) return null;
  try { return require('../utils/shiprocket'); }
  catch { return null; }
};

// ═══════════════════════════════════════════════════════════════════
// 1. SELLER: Mark order ready for pickup - Processing → Confirmed
//    POST /api/delivery/ready/:orderId
// ═══════════════════════════════════════════════════════════════════
router.post('/ready/:orderId', protect, sellerOrAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email fcmToken')
      .populate('orderItems.product', 'name price')
      .populate({
        path: 'orderItems.product',
        populate: { path: 'createdBy', select: 'name phone sellerInfo' }
      });
    if (!order)
      return res.status(404).json({ success: false, message: 'Order not found' });
    if (!['Processing', 'Confirmed'].includes(order.orderStatus))
      return res.status(400).json({ success: false, message: `Cannot mark ready - order is ${order.orderStatus}` });

    let waybill = null;

    if (!PROTOTYPE_MODE) {
      try {
        const shiprocket = getShiprocket();
        if (shiprocket) {
          const sellerUser = order.orderItems?.[0]?.product?.createdBy;

          const result = await shiprocket.createShipment(order, sellerUser);
          waybill = result?.packages?.[0]?.waybill || null;
          console.log(`📦 Shiprocket AWB: ${waybill}`);
        }
      } catch (err) {
        console.error('⚠️ Shiprocket error:', err.message);
      }
    } else {
      waybill = `PROTO${Date.now().toString().slice(-8)}`;
      console.log(`📦 [PROTOTYPE] Fake waybill: ${waybill}`);
    }

    order.orderStatus = 'Confirmed';
    order.trackingId = waybill;
    order.readyAt = new Date();
    order.statusHistory.push({
      status: 'Confirmed',
      timestamp: new Date(),
      message: PROTOTYPE_MODE
        ? `[Prototype] Ready for pickup. Waybill: ${waybill}`
        : `Shiprocket pickup scheduled. AWB: ${waybill}`,
      updatedBy: req.user._id,
    });
    await order.save();
    await notifyUser(
      order.user,
      "Order Confirmed",
      `Your order is confirmed. Tracking ID: ${order.trackingId}`
    );

    res.json({
      success: true,
      message: PROTOTYPE_MODE
        ? `📦 [Prototype] Ready for pickup! Waybill: ${waybill}`
        : `📦 Pickup scheduled! AWB: ${waybill}`,
      waybill,
      order,
      mode: PROTOTYPE_MODE ? 'prototype' : 'live',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// 2. PROTOTYPE: Simulate next delivery step
//    POST /api/delivery/simulate/:orderId
// ═══════════════════════════════════════════════════════════════════
router.post('/simulate/:orderId', protect, sellerOrAdmin, async (req, res) => {
  if (!PROTOTYPE_MODE) {
    return res.status(403).json({
      success: false,
      message: 'Simulation is disabled in live mode. Shiprocket handles status updates via webhook.',
    });
  }

  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email fcmToken')
      .populate('orderItems.product', 'name price')
      .populate({
        path: 'orderItems.product',
        populate: { path: 'createdBy', select: 'name phone sellerInfo' }
      });
    if (!order)
      return res.status(404).json({ success: false, message: 'Order not found' });

    const currentIdx = STATUS_FLOW.indexOf(order.orderStatus);
    if (currentIdx === -1 || currentIdx >= STATUS_FLOW.length - 1) {
      return res.status(400).json({
        success: false,
        message: `Order is already at final status: ${order.orderStatus}`,
      });
    }

    const prevStatus = order.orderStatus;
    const nextStatus = STATUS_FLOW[currentIdx + 1];

    order.orderStatus = nextStatus;
    order.statusHistory.push({
      status: nextStatus,
      timestamp: new Date(),
      message: `[Prototype] Simulated: ${prevStatus} → ${nextStatus}`,
      updatedBy: req.user._id,
    });

    if (nextStatus === 'Delivered') {
      order.deliveredAt = new Date();
      order.isPaid = true;
      order.paymentStatus = order.paymentMethod === 'COD' ? 'Paid' : order.paymentStatus;
      order.payoutEligible = true;
      console.log(`✅ [PROTOTYPE] Order ${order._id} delivered. Payout eligible.`);
    }

    await order.save();
    const statusMessages = {
      Confirmed: "Your order is confirmed ✅",
      Shipped: "Your order is shipped 🚚",
      "Out for Delivery": "Your order is out for delivery 📦",
      Delivered: "Your order is delivered 🎉",
    };

    await notifyUser(
      order.user,
      "Order Update",
      statusMessages[nextStatus] || `Order status updated to ${nextStatus}`
    );
    res.json({
      success: true,
      message: `[Prototype] ${prevStatus} → ${nextStatus}`,
      previousStatus: prevStatus,
      newStatus: nextStatus,
      payoutEligible: order.payoutEligible,
      remainingSteps: STATUS_FLOW.slice(currentIdx + 2),
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// 3. TRACK SHIPMENT - GET /api/delivery/track/:waybill
// ═══════════════════════════════════════════════════════════════════
router.get('/track/:waybill', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ trackingId: req.params.waybill });

    if (PROTOTYPE_MODE) {
      return res.json({
        success: true,
        mode: 'prototype',
        waybill: req.params.waybill,
        currentStatus: order?.orderStatus || 'Unknown',
        statusHistory: order?.statusHistory || [],
        message: 'Prototype tracking - real tracking available after Shiprocket integration',
      });
    }

    const shiprocket = getShiprocket();
    if (shiprocket) {
      const data = await shiprocket.trackShipment(req.params.waybill, order?.orderStatus);
      return res.json({ success: true, data, currentStatus: order?.orderStatus });
    }

    res.json({ success: true, currentStatus: order?.orderStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// 4. ADMIN: Cancel shipment - POST /api/delivery/cancel/:orderId
// ═══════════════════════════════════════════════════════════════════
router.post('/cancel/:orderId', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email fcmToken')
      .populate('orderItems.product', 'name price')
      .populate({
        path: 'orderItems.product',
        populate: { path: 'createdBy', select: 'name phone sellerInfo' }
      });
    if (!order)
      return res.status(404).json({ success: false, message: 'Order not found' });

    if (!PROTOTYPE_MODE && order.trackingId) {
      const shiprocket = getShiprocket();
      if (shiprocket) {
        await shiprocket.cancelShipment(order.trackingId).catch(e =>
          console.error('Cancel shipment error:', e.message)
        );
      }
    }

    for (const item of order.orderItems) {
      await require('../models/Product').findByIdAndUpdate(
        item.product, { $inc: { stock: item.quantity } }
      );
    }

    order.orderStatus = 'Cancelled';
    order.payoutEligible = false;
    order.statusHistory.push({
      status: 'Cancelled', timestamp: new Date(),
      message: 'Cancelled by admin', updatedBy: req.user._id,
    });
    await order.save();
    await notifyUser(
      order.user,
      "Order Cancelled",
      "Your order has been cancelled ❌"
    );

    res.json({ success: true, message: 'Order cancelled and shipment cancelled', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// 5. SHIPROCKET WEBHOOK - POST /api/delivery/webhook
// ═══════════════════════════════════════════════════════════════════
router.post('/webhook', async (req, res) => {
  try {
    if (PROTOTYPE_MODE)
      return res.status(200).json({ success: true, message: 'Prototype mode - webhook ignored' });

    const token = process.env.SHIPROCKET_WEBHOOK_TOKEN;
    if (token) {
      const received = req.headers['x-api-key'] || req.headers['authorization'];
      if (received !== token) return res.status(200).json({ success: true });
    }

    const { awb, current_status } = req.body;
    if (!awb || !current_status) return res.status(200).json({ success: true });

    const order = await Order.findOne({ trackingId: awb })
      .populate('user', 'name email fcmToken');

    if (!order) return res.status(200).json({ success: true });

    const statusMap = {
      'pickup scheduled': 'Confirmed',
      'picked up': 'Shipped',
      'in transit': 'Shipped',
      'out for delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'undelivered': 'Out for Delivery',
      'rto initiated': 'Returned',
    };
    const newStatus = statusMap[current_status?.toLowerCase()];

    if (newStatus && order.orderStatus !== newStatus) {
      const prev = order.orderStatus;
      order.orderStatus = newStatus;
      order.statusHistory.push({ status: newStatus, timestamp: new Date(), message: `Shiprocket: ${current_status}` });
      if (newStatus === 'Delivered') {
        order.deliveredAt = new Date();
        order.isPaid = true;
        order.paymentStatus = order.paymentMethod === 'COD' ? 'Paid' : order.paymentStatus;
        order.payoutEligible = true;
      }
      await order.save();
      await notifyUser(
        order.user,
        "Order Update",
        `Your order status is now ${newStatus}`
      );
      console.log(`📊 Webhook: Order ${order._id}: ${prev} → ${newStatus}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(200).json({ success: true });
  }
});

// ═══════════════════════════════════════════════════════════════════
// GET DELIVERY CHARGES FOR CUSTOMER
// GET /api/delivery/charges
// ═══════════════════════════════════════════════════════════════════
router.get('/charges', async (req, res) => {
  try {
    const { customerPincode, customerCity, customerState, productId } = req.query;

    const ZONES = {
      SAME_CITY: { charge: 40, label: 'Zone 1 - Same City', days: '1-2 days' },
      SAME_STATE: { charge: 60, label: 'Zone 2 - Same State', days: '2-3 days' },
      NEARBY_STATE: { charge: 80, label: 'Zone 3 - Nearby State', days: '3-5 days' },
      FAR_STATE: { charge: 100, label: 'Zone 4 - Rest of India', days: '5-7 days' },
    };

    const NEARBY_STATES = {
      'Maharashtra': ['Gujarat', 'Goa', 'Madhya Pradesh', 'Karnataka', 'Telangana', 'Chhattisgarh'],
      'Delhi': ['Haryana', 'Uttar Pradesh', 'Rajasthan', 'Punjab'],
      'Karnataka': ['Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Goa'],
      'Tamil Nadu': ['Kerala', 'Karnataka', 'Andhra Pradesh', 'Puducherry'],
      'Gujarat': ['Maharashtra', 'Rajasthan', 'Madhya Pradesh'],
      'West Bengal': ['Bihar', 'Jharkhand', 'Odisha', 'Sikkim', 'Assam'],
      'Telangana': ['Andhra Pradesh', 'Maharashtra', 'Karnataka', 'Chhattisgarh', 'Odisha'],
      'Andhra Pradesh': ['Telangana', 'Karnataka', 'Tamil Nadu', 'Odisha'],
      'Rajasthan': ['Gujarat', 'Madhya Pradesh', 'Uttar Pradesh', 'Haryana', 'Punjab', 'Delhi'],
      'Uttar Pradesh': ['Delhi', 'Haryana', 'Rajasthan', 'Madhya Pradesh', 'Bihar', 'Jharkhand'],
      'Kerala': ['Karnataka', 'Tamil Nadu'],
      'Punjab': ['Haryana', 'Delhi', 'Himachal Pradesh', 'Rajasthan'],
      'Haryana': ['Delhi', 'Punjab', 'Rajasthan', 'Uttar Pradesh'],
    };

    let sellerCity = '', sellerState = '', sellerPincode = '';

    if (productId) {
      try {
        const Product = require('../models/Product');
        const product = await Product.findById(productId).populate('createdBy', 'sellerInfo role');
        if (product?.createdBy?.role === 'seller') {
          sellerCity = product.createdBy.sellerInfo?.address?.city || '';
          sellerState = product.createdBy.sellerInfo?.address?.state || '';
          sellerPincode = product.createdBy.sellerInfo?.address?.pincode || '';
        }
      } catch (e) { /* ignore */ }
    }

    const uCity = (customerCity || '').trim().toLowerCase();
    const sCity = sellerCity.trim().toLowerCase();
    const uState = (customerState || '').trim();
    const sState = sellerState.trim();

    let zoneName = 'FAR_STATE';
    if (sCity && uCity && uCity === sCity) zoneName = 'SAME_CITY';
    else if (sState && uState.toLowerCase() === sState.toLowerCase()) zoneName = 'SAME_STATE';
    else if (sState && (NEARBY_STATES[sState] || []).some(s => s.toLowerCase() === uState.toLowerCase())) zoneName = 'NEARBY_STATE';

    const zone = ZONES[zoneName];

    res.json({
      success: true,
      zone: zoneName,
      charge: zone.charge,
      label: zone.label,
      days: zone.days,
      allZones: Object.entries(ZONES).map(([key, val]) => ({ key, ...val, active: key === zoneName })),
      sellerCity,
      sellerState,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SHIPPING LABEL
// GET /api/delivery/label/:orderId
//
// BARCODE NOTES:
//   • In PROTOTYPE mode: renders a visual CSS barcode from the AWB string.
//     The bars are cosmetic only — not scannable by a real scanner.
//   • In LIVE (Shiprocket) mode: Shiprocket returns a real PDF label with
//     a scannable Code128 barcode. This route tries that PDF first.
//     If that fails, it falls back to this HTML label with the CSS barcode.
//   • To get a real scannable barcode in HTML: integrate JsBarcode or
//     use Shiprocket's label PDF (recommended for production).
// ═══════════════════════════════════════════════════════════════════

// ── Serve external print.js to satisfy CSP (no inline scripts) ──
router.get('/print.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    document.addEventListener('DOMContentLoaded', function() {
      var p = document.getElementById('printBtn');
      var c = document.getElementById('closeBtn');
      if (p) p.addEventListener('click', function() { window.print(); });
      if (c) c.addEventListener('click', function() { window.close(); });
    });
  `);
});

router.get('/label/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email fcmToken')
      .populate('orderItems.product', 'name price')
      .populate({
        path: 'orderItems.product',
        populate: { path: 'createdBy', select: 'name phone sellerInfo' }
      });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // ── Try Shiprocket PDF label first (LIVE mode) ──────────────
    // When Shiprocket assigns an AWB, their PDF label contains a real
    // scannable Code128 barcode. We try to fetch that PDF URL here.
    if (!PROTOTYPE_MODE && order.trackingId) {
      try {
        const shiprocket = getShiprocket();
        if (shiprocket) {
          const token = await shiprocket.getToken ? shiprocket.getToken() : null;
          const axios = require('axios');
          const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
          const labelRes = await axios.post(
            'https://apiv2.shiprocket.in/v1/external/courier/generate/label',
            { shipment_id: [order.shiprocketShipmentId].filter(Boolean) },
            { headers }
          );
          const labelUrl = labelRes.data?.label_url;
          if (labelUrl) return res.json({ success: true, type: 'pdf', url: labelUrl });
        }
      } catch (e) {
        console.warn('⚠️ Shiprocket label fetch failed, using HTML fallback:', e.message);
      }
    }

    // ── HTML Label fallback (branded, print-perfect) ─────────────
    const sellerUser = order.orderItems?.[0]?.product?.createdBy;
    const sellerAddr = sellerUser?.sellerInfo?.address || {};
    const custAddr = order.shippingAddress || {};
    const isCOD = order.paymentMethod === 'COD';
    const awb = order.trackingId || '—';
    const orderId = order._id.toString().slice(-8).toUpperCase();
    const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    // ── Visual barcode from AWB (cosmetic, not scannable) ────────
    // Each character maps to a bar width (1-3px) based on char code.
    // This is VISUAL ONLY. For a real scannable barcode, use Shiprocket's
    // PDF label (LIVE mode) or integrate the JsBarcode library.
    const awbClean = (awb === '—' ? orderId : awb)
      .replace(/[^A-Z0-9]/gi, '').toUpperCase().padEnd(24, '0').slice(0, 24);
    const barcodeSvgBars = awbClean.split('').map(ch => {
      const code = ch.charCodeAt(0);
      const w = (code % 3) + 1;
      const gap = (code % 2) + 1;
      return `<rect x="0" y="0" width="${w}" height="48" fill="#111"/>
              <rect x="${w}" y="0" width="${gap}" height="48" fill="white"/>`;
    });
    // Build SVG with cumulative x positions
    let cx = 0;
    const bars = awbClean.split('').map(ch => {
      const code = ch.charCodeAt(0);
      const w = (code % 3) + 1;
      const gap = (code % 2) + 1;
      const bar = `<rect x="${cx}" y="0" width="${w}" height="48" fill="#111"/>`;
      cx += w + gap;
      return bar;
    }).join('');
    const svgWidth = cx;

    // ── Items rows ───────────────────────────────────────────────
    const items = (order.orderItems || []).map((item, idx) =>
      `<tr style="background:${idx % 2 === 0 ? '#fafafa' : '#ffffff'};">
        <td style="padding:9px 12px;border-bottom:1px solid #ececec;font-size:12px;color:#222;">${item.name || '—'}</td>
        <td style="padding:9px 12px;border-bottom:1px solid #ececec;text-align:center;font-size:12px;font-weight:700;color:#333;">${item.quantity}</td>
        <td style="padding:9px 12px;border-bottom:1px solid #ececec;text-align:right;font-size:12px;font-weight:700;color:#111;">&#8377;${(item.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>`
    ).join('');

    const logoUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/logo.png`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Shipping Label &#8212; #${orderId}</title>
  <style>
    /* ── Google Font ── */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

    /* ── FIX: Force colors to print ── */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
      background: #d6d6d6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 28px 16px 100px;
    }

    /* ── Outer wrapper ── */
    .label-wrap { width: 100%; max-width: 700px; }

    /* ── Main card ── */
    .label {
      background: #ffffff;
      border: 1px solid #c0c0c0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    }

    /* ═══ HEADER ═══════════════════════════════════════════════ */
    .header {
      background: #0d0d0d;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .logo-img {
      height: 44px;
      width: auto;
      object-fit: contain;
      /* If logo is dark, invert it for dark background */
      filter: brightness(0) invert(1);
    }

    .logo-text-block { display: flex; flex-direction: column; gap: 1px; }

    .brand-name {
      font-size: 26px;
      font-weight: 900;
      color: #C9A84C;
      letter-spacing: 6px;
      text-transform: uppercase;
      line-height: 1;
    }

    .brand-tagline {
      font-size: 8px;
      color: rgba(255,255,255,0.38);
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .awb-block {
      background: #C9A84C;
      border-radius: 8px;
      padding: 10px 18px;
      text-align: center;
      min-width: 140px;
    }

    .awb-label {
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2.5px;
      color: rgba(0,0,0,0.5);
      display: block;
      margin-bottom: 4px;
    }

    .awb-value {
      font-size: 15px;
      font-weight: 900;
      color: #000;
      letter-spacing: 1px;
      word-break: break-all;
      line-height: 1.2;
    }

    /* ═══ META STRIP ════════════════════════════════════════════ */
    .meta-strip {
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
    }

    .meta-item { display: flex; flex-direction: column; gap: 2px; }

    .meta-label {
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #999;
    }

    .meta-value {
      font-size: 13.5px;
      font-weight: 800;
      color: #111;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .badge-cod {
      background: #fff8e1;
      color: #92400e;
      border: 1.5px solid #f59e0b;
    }

    .badge-prepaid {
      background: #ecfdf5;
      color: #065f46;
      border: 1.5px solid #10b981;
    }

    /* ═══ ADDRESS GRID ══════════════════════════════════════════ */
    .addr-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: 2px dashed #ddd;
    }

    .addr-box { padding: 18px 22px; }

    .addr-box:first-child { border-right: 2px dashed #ddd; }

    .addr-section-label {
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #bbb;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .addr-name {
      font-size: 16px;
      font-weight: 800;
      color: #111;
      margin-bottom: 5px;
    }

    .addr-line {
      font-size: 12px;
      color: #444;
      line-height: 1.75;
    }

    .addr-phone {
      margin-top: 8px;
      font-size: 12px;
      font-weight: 700;
      color: #111;
      background: #f0f0f0;
      display: inline-block;
      padding: 3px 10px;
      border-radius: 5px;
    }

    /* ═══ ITEMS TABLE ═══════════════════════════════════════════ */
    .items-header {
      padding: 10px 20px 9px;
      background: #f7f7f7;
      border-top: 2px dashed #ddd;
      border-bottom: 1px solid #e8e8e8;
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .items-header-label {
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #bbb;
    }

    table { width: 100%; border-collapse: collapse; }

    thead th {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #999;
      padding: 8px 12px;
      background: #fafafa;
      border-bottom: 2px solid #e8e8e8;
      text-align: left;
    }

    thead th:nth-child(2) { text-align: center; }
    thead th:last-child   { text-align: right; }

    .total-row td {
      padding: 11px 12px;
      font-size: 13px;
      font-weight: 800;
      color: #111;
      background: #f2f2f2;
      border-top: 2px solid #ddd;
    }

    .total-row td:last-child { text-align: right; font-size: 15px; }

    /* ═══ BARCODE STRIP ═════════════════════════════════════════ */
    /*
     * This is a VISUAL barcode drawn from the AWB characters.
     * It is cosmetic only — real scanners CANNOT read it.
     *
     * In LIVE mode with Shiprocket, use their PDF label instead
     * (it contains a real Code128 scannable barcode).
     *
     * To add a real scannable barcode to this HTML label:
     *   1. Add JsBarcode via CDN: <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js">
     *   2. Replace the SVG below with: <svg id="barcode"></svg>
     *   3. Call: JsBarcode("#barcode", "${awbClean}", { format:"CODE128", displayValue:true });
     */
    .barcode-strip {
      padding: 16px 24px 12px;
      background: #fafafa;
      border-top: 1px solid #ececec;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 7px;
    }

    .barcode-svg { display: block; }

    .barcode-text {
      font-family: 'Courier New', Courier, monospace;
      font-size: 10px;
      letter-spacing: 3px;
      color: #555;
      text-transform: uppercase;
    }

    /* ═══ FOOTER ════════════════════════════════════════════════ */
    .footer {
      background: #0d0d0d;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .footer-brand { font-size: 12px; font-weight: 900; color: #C9A84C; letter-spacing: 3px; }
    .footer-url   { font-size: 9px; color: rgba(255,255,255,0.3); margin-top: 2px; }
    .footer-care  { font-size: 10px; color: rgba(255,255,255,0.4); text-align: right; }
    .footer-oid   { font-size: 9px; color: rgba(255,255,255,0.22); font-family: monospace; letter-spacing: 1px; margin-top: 2px; text-align: right; }

    /* ═══ ACTION BAR (screen only) ══════════════════════════════ */
    .action-bar {
      margin-top: 24px;
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .btn-print {
      background: #C9A84C;
      color: #000;
      border: none;
      padding: 14px 36px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      letter-spacing: 0.4px;
      box-shadow: 0 4px 18px rgba(201,168,76,0.45);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.1s, box-shadow 0.1s;
    }

    .btn-print:hover { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(201,168,76,0.5); }
    .btn-print:active { transform: translateY(0); }

    .btn-close {
      background: #fff;
      color: #333;
      border: 2px solid #ccc;
      padding: 14px 26px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s;
    }

    .btn-close:hover { background: #f5f5f5; border-color: #999; }

    /* ═══ PRINT OVERRIDES ═══════════════════════════════════════ */
    @media print {
      @page {
        size: A5 portrait;
        margin: 6mm;
      }

      body {
        background: #ffffff !important;
        padding: 0 !important;
        display: block !important;
      }

      .label-wrap {
        max-width: 100% !important;
        width: 100% !important;
      }

      .label {
        box-shadow: none !important;
        border: 1px solid #bbb !important;
        border-radius: 0 !important;
      }

      /* ── Force all colored backgrounds to print ── */
      .header        { background: #0d0d0d !important; }
      .footer        { background: #0d0d0d !important; }
      .awb-block     { background: #C9A84C !important; }
      .meta-strip    { background: #f5f5f5 !important; }
      .items-header  { background: #f7f7f7 !important; }
      .barcode-strip { background: #fafafa !important; }
      .total-row td  { background: #f2f2f2 !important; }
      .badge-prepaid { background: #ecfdf5 !important; border-color: #10b981 !important; }
      .badge-cod     { background: #fff8e1 !important; border-color: #f59e0b !important; }

      /* ── Force text colors ── */
      .brand-name  { color: #C9A84C !important; }
      .awb-value   { color: #000 !important; }
      .footer-brand { color: #C9A84C !important; }

      .action-bar { display: none !important; }
    }
  </style>
</head>
<body>

<div class="label-wrap">
  <div class="label">

    <!-- ══ HEADER ══════════════════════════════════════════════ -->
    <div class="header">
      <div class="logo-area">
        <!-- Logo image: served from /logo.png in your public folder -->
        <!-- If logo doesn't load, brand name text shows as fallback -->
        <img
          class="logo-img"
          src="${logoUrl}"
          alt="VideStore Logo"
          onerror="this.style.display='none'"
        />
        <div class="logo-text-block">
          <div class="brand-name">VIDESTORE</div>
          <div class="brand-tagline">Fashion Forward &amp; Premium Quality</div>
        </div>
      </div>
      <div class="awb-block">
        <span class="awb-label">AWB No.</span>
        <!-- AWB from Shiprocket (LIVE) or PROTO-XXXXXXXX (prototype) -->
        <div class="awb-value">${awb}</div>
      </div>
    </div>

    <!-- ══ META STRIP ═══════════════════════════════════════════ -->
    <div class="meta-strip">
      <div class="meta-item">
        <span class="meta-label">Order ID</span>
        <span class="meta-value">#${orderId}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Order Date</span>
        <span class="meta-value">${date}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Payment Mode</span>
        <span class="badge ${isCOD ? 'badge-cod' : 'badge-prepaid'}">
          ${isCOD ? '&#128181; Cash on Delivery' : '&#9989; Prepaid'}
        </span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Total Items</span>
        <span class="meta-value">${order.orderItems?.length || 0} item${(order.orderItems?.length || 0) !== 1 ? 's' : ''}</span>
      </div>
    </div>

    <!-- ══ ADDRESS GRID ══════════════════════════════════════════ -->
    <div class="addr-grid">

      <!-- Ship To -->
      <div class="addr-box">
        <div class="addr-section-label">
          <span>&#128230;</span> Deliver To (Ship To)
        </div>
        <div class="addr-name">${custAddr.fullName || order.user?.name || '—'}</div>
        <div class="addr-line">${custAddr.addressLine1 || '—'}${custAddr.addressLine2 ? ', ' + custAddr.addressLine2 : ''}</div>
        <div class="addr-line">${custAddr.city || ''}, ${custAddr.state || ''}</div>
        <div class="addr-line">PIN: <strong>${custAddr.pincode || '—'}</strong></div>
        <div class="addr-phone">&#128222; ${custAddr.phone || order.user?.phone || '—'}</div>
      </div>

      <!-- Return To -->
      <div class="addr-box">
        <div class="addr-section-label">
          <span>&#127978;</span> Return To (Dispatch From)
        </div>
        <div class="addr-name">${sellerUser?.sellerInfo?.businessName || sellerUser?.name || 'VideStore Seller'}</div>
        <div class="addr-line">${sellerAddr.line || sellerAddr.addressLine1 || '—'}</div>
        <div class="addr-line">${sellerAddr.city || ''}, ${sellerAddr.state || ''}</div>
        <div class="addr-line">PIN: <strong>${sellerAddr.pincode || '—'}</strong></div>
        <div class="addr-phone">&#128222; ${sellerUser?.phone || '—'}</div>
      </div>

    </div>

    <!-- ══ ITEMS TABLE ═══════════════════════════════════════════ -->
    <div>
      <div class="items-header">
        <span style="font-size:13px;">&#128717;</span>
        <span class="items-header-label">Order Items</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Product Description</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="2">
              Sub-total + Shipping &amp; Handling
              ${isCOD ? `<span style="margin-left:8px;background:#fff8e1;color:#92400e;border:1px solid #f59e0b;padding:2px 9px;border-radius:20px;font-size:9px;font-weight:800;letter-spacing:0.5px;">COLLECT ON DELIVERY</span>` : ''}
            </td>
            <td style="text-align:right;font-size:15px;">&#8377;${(order.totalPrice || 0).toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- ══ BARCODE STRIP ═════════════════════════════════════════
         VISUAL barcode from AWB — cosmetic only, not scannable.
         Shiprocket LIVE PDF label has a real scannable barcode.
    ════════════════════════════════════════════════════════════ -->
    <div class="barcode-strip">
      <svg
        class="barcode-svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 ${svgWidth || 200} 48"
        width="${Math.min(svgWidth || 200, 320)}"
        height="48"
        role="img"
        aria-label="Visual barcode for AWB ${awbClean}"
      >
        ${bars}
      </svg>
      <div class="barcode-text">${awbClean}</div>
    </div>

    <!-- ══ FOOTER ════════════════════════════════════════════════ -->
    <div class="footer">
      <div>
        <div class="footer-brand">VIDESTORE</div>
        <div class="footer-url">www.videstore.onrender.com</div>
      </div>
      <div>
        <div class="footer-care">Handled with care &#9825;</div>
        <div class="footer-oid">ORDER #${orderId}</div>
      </div>
    </div>

  </div><!-- /.label -->

  <!-- ══ ACTION BUTTONS (hidden on print) ═════════════════════ -->
  <div class="action-bar">
    <button class="btn-print" id="printBtn">&#128424;&nbsp; Print Label</button>
    <button class="btn-close" id="closeBtn">&#10005; Close</button>
  </div>

</div><!-- /.label-wrap -->

<!-- External script: avoids CSP inline-script block -->
<script src="/api/delivery/print.js"></script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(Buffer.from(html, 'utf8'));

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// REVERSE PICKUP (Return from customer → seller)
// POST /api/delivery/reverse/:orderId
// Called after return is approved to schedule pickup from customer.
// ═══════════════════════════════════════════════════════════════════
router.post('/reverse/:orderId', protect, sellerOrAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email fcmToken')
      .populate('orderItems.product', 'name price')
      .populate({
        path: 'orderItems.product',
        populate: { path: 'createdBy', select: 'name phone sellerInfo' }
      });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const allowedStatuses = ['Return Approved', 'Return Requested'];
    if (!allowedStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Reverse pickup only allowed for approved return orders. Current status: ${order.orderStatus}`,
      });
    }

    let reverseAwb = null;

    if (!PROTOTYPE_MODE) {
      try {
        const shiprocket = getShiprocket();
        if (shiprocket && shiprocket.createReversePickup) {
          const sellerUser = order.orderItems?.[0]?.product?.createdBy;
          const result = await shiprocket.createReversePickup(order, sellerUser);
          reverseAwb = result?.packages?.[0]?.waybill || result?.awb || null;
          console.log(`🔄 Shiprocket Reverse AWB: ${reverseAwb}`);
        }
      } catch (err) {
        console.error('⚠️ Shiprocket reverse pickup error:', err.message);
      }
    } else {
      reverseAwb = `RPROTO${Date.now().toString().slice(-8)}`;
      console.log(`🔄 [PROTOTYPE] Fake reverse AWB: ${reverseAwb}`);
    }

    order.returnRequest = order.returnRequest || {};
    order.returnRequest.reverseAwb = reverseAwb;
    order.returnRequest.reversePickupScheduled = true;
    order.returnRequest.reversePickupAt = new Date();
    order.statusHistory.push({
      status: order.orderStatus,
      timestamp: new Date(),
      message: PROTOTYPE_MODE
        ? `[Prototype] Reverse pickup scheduled. AWB: ${reverseAwb}`
        : `Shiprocket reverse pickup scheduled. AWB: ${reverseAwb}`,
      updatedBy: req.user._id,
    });
    await order.save();
    await notifyUser(
      order.user,
      "Return Pickup Scheduled",
      `Reverse pickup scheduled. AWB: ${reverseAwb}`
    );

    res.json({
      success: true,
      message: PROTOTYPE_MODE
        ? `🔄 [Prototype] Reverse pickup scheduled! AWB: ${reverseAwb}`
        : `🔄 Reverse pickup scheduled! AWB: ${reverseAwb}`,
      reverseAwb,
      order,
      mode: PROTOTYPE_MODE ? 'prototype' : 'live',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Mode info ─────────────────────────────────────────────────────
router.get('/mode', async (req, res) => {
  const isPrototype = process.env.PROTOTYPE_MODE !== 'false';
  res.json({
    success: true,
    mode: isPrototype ? 'prototype' : 'live',
    isPrototype,
    shiprocketEmail: isPrototype ? null : (process.env.SHIPROCKET_EMAIL ? '✅ Configured' : '❌ Not set'),
    message: isPrototype
      ? 'Prototype mode - set PROTOTYPE_MODE=false in .env to enable Shiprocket'
      : 'Live mode - Shiprocket API active',
    statusFlow: STATUS_FLOW,
  });
});

// ═══════════════════════════════════════════════════════════════════
// CHECK PINCODE SERVICEABILITY
// GET /api/delivery/check-pincode?pincode=500001
// ═══════════════════════════════════════════════════════════════════
router.get('/check-pincode', async (req, res) => {
  try {
    const { pincode } = req.query;

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        serviceable: false,
        message: 'Enter a valid 6-digit pincode',
      });
    }

    if (PROTOTYPE_MODE) {
      return res.json({
        success: true,
        serviceable: true,
        message: 'Serviceable (prototype mode)',
        mode: 'prototype',
        charge: null,
      });
    }

    try {
      const deliveryService = require('../utils/deliveryService');
      const sellerPincode = req.query.sellerPincode || '500001';

      const result = await deliveryService.getDeliveryCharge(
        { pincode },
        { pincode: sellerPincode }
      );

      if (result.notServiceable) {
        return res.json({
          success: true,
          serviceable: false,
          message: `Delivery not available to pincode ${pincode}. Please try a different address.`,
          pincode,
        });
      }

      return res.json({
        success: true,
        serviceable: true,
        message: `Delivery available${result.courierName ? ` via ${result.courierName}` : ''}`,
        charge: result.charge,
        courierName: result.courierName || null,
        estimatedDays: result.estimatedDays || null,
        zone: result.zone,
        pincode,
      });

    } catch (err) {
      console.error('Serviceability check error:', err.message);
      return res.json({
        success: true,
        serviceable: true,
        message: 'Delivery available',
        fallback: true,
      });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

function sellerOrAdmin(req, res, next) {
  if (req.user && (req.user.role === 'seller' || req.user.role === 'admin'))
    return next();
  res.status(403).json({ success: false, message: 'Seller or Admin access required' });
}