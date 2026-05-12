// controllers/returnController.js
const Order = require('../models/Order');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

let cloudinary;
try { cloudinary = require('../config/cloudinary').cloudinary; } catch { cloudinary = null; }

let Notification;
try { Notification = require('../models/Notification'); } catch { Notification = null; }

const createNotification = async (data) => {
    if (!Notification) return;
    try { await Notification.create(data); } catch { /* non-fatal */ }
};

// ═══════════════════════════════════════════════════════════════════
// POST /api/orders/:id/return
// ═══════════════════════════════════════════════════════════════════
const requestReturn = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate({ path: 'orderItems.product', populate: { path: 'createdBy', select: 'name email _id' } });

        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.user._id.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });
        if (order.orderStatus !== 'Delivered')
            return res.status(400).json({ message: 'Return can only be requested for delivered orders' });

        const deliveredEntry = order.statusHistory?.find(h => h.status === 'Delivered');
        const deliveredAt = deliveredEntry?.timestamp || order.deliveredAt;
        if (!deliveredAt)
            return res.status(400).json({ message: 'Delivery date not found on this order' });

        const daysSince = (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince > 6)
            return res.status(400).json({ message: 'Return window has expired. Returns must be requested within 6 days of delivery.' });

        if (['Return Requested', 'Return Approved', 'Return Rejected', 'Returned'].includes(order.orderStatus))
            return res.status(400).json({ message: 'A return request already exists for this order' });

        const { reason, reasonLabel, note, upiId } = req.body;
        if (!reason) return res.status(400).json({ message: 'Return reason is required' });

        const uploadedImages = [];
        if (cloudinary && req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                    const result = await cloudinary.uploader.upload(base64, { folder: `returns/${order._id}`, resource_type: 'image' });
                    uploadedImages.push({ url: result.secure_url, public_id: result.public_id });
                } catch (e) { console.error('Cloudinary upload error:', e.message); }
            }
        }

        order.returnRequest = {
            reason,
            reasonLabel: reasonLabel || reason,
            note: note || '',
            upiId: upiId || '',
            images: uploadedImages,
            requestedAt: new Date(),
            status: 'Pending',
        };
        order.orderStatus = 'Return Requested';
        order.statusHistory.push({
            status: 'Return Requested', timestamp: new Date(),
            message: `Customer requested return. Reason: ${reasonLabel || reason}`,
        });
        await order.save();

        const orderId = order._id.toString().slice(-8).toUpperCase();
        const frontendUrl = process.env.FRONTEND_URL || 'https://videstore.onrender.com';
        const photoHtml = uploadedImages.length > 0
            ? `<div style="margin-top:12px;">${uploadedImages.map(img => `<img src="${img.url}" style="width:80px;height:96px;object-fit:cover;border-radius:4px;margin-right:6px;" />`).join('')}</div>`
            : '';

        // Notify sellers
        const sellerIds = [...new Set(order.orderItems.map(i => i.sellerId?.toString()).filter(Boolean))];
        const SellerAccount = require('../models/SellerAccount');
        const sellerAccounts = await SellerAccount.find({ _id: { $in: sellerIds } }).populate('ownerUserId', 'email name');

        for (const account of sellerAccounts) {
            const owner = account.ownerUserId;
            if (!owner) continue;
            await createNotification({ recipient: owner._id, type: 'return_request', title: 'Return Request Received', message: `Order #${orderId} — Reason: ${reasonLabel || reason}`, orderId: order._id, isRead: false });
            try {
                await sendEmail({
                    to: owner.email, subject: `Return Request: Order #${orderId} — Action Required`,
                    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;background:#111;color:#fff;padding:32px;border-radius:8px;">
            <h2 style="color:#C9A84C;font-weight:300;">Return Request Received</h2>
            <p style="color:rgba(255,255,255,0.6);font-size:14px;">Hi ${owner.name}, a customer has requested a return for order <strong style="color:#fff;">#${orderId}</strong>. Please respond within 48 hours.</p>
            <div style="background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:20px;margin:20px 0;">
              <p style="color:#fff;font-size:14px;margin:4px 0;"><strong>Reason:</strong> ${reasonLabel || reason}</p>
              ${note ? `<p style="color:rgba(255,255,255,0.6);font-size:13px;margin:8px 0 0;"><strong>Customer Note:</strong> ${note}</p>` : ''}
              ${upiId ? `<p style="color:rgba(255,255,255,0.6);font-size:13px;margin:8px 0 0;"><strong>UPI ID:</strong> ${upiId}</p>` : ''}
              <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:8px 0 0;"><strong>Customer:</strong> ${order.user.name} (${order.user.email})</p>
              <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:4px 0 0;"><strong>Order Total:</strong> ₹${order.totalPrice?.toLocaleString('en-IN')}</p>
              ${photoHtml}
            </div>
            <a href="${frontendUrl}/seller" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#C9A84C;color:#000;font-weight:600;text-decoration:none;border-radius:4px;font-size:13px;">View in Seller Dashboard</a>
          </div>`,
                });
            } catch (e) { console.error('Seller email error:', e.message); }
        }

        // Notify admins
        const admins = await User.find({ role: 'admin' }).select('email name _id');
        for (const adm of admins) {
            await createNotification({ recipient: adm._id, type: 'return_request', title: 'New Return Request', message: `Order #${orderId} · ${reasonLabel || reason} · ${order.user.name}`, orderId: order._id, isRead: false });
            try {
                await sendEmail({
                    to: adm.email, subject: `[Admin] Return Request: Order #${orderId}`,
                    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;background:#111;color:#fff;padding:32px;border-radius:8px;">
            <h2 style="color:#C9A84C;font-weight:300;">New Return Request</h2>
            <p style="color:rgba(255,255,255,0.6);font-size:14px;">Customer <strong style="color:#fff;">${order.user.name}</strong> (${order.user.email}) has requested a return for order <strong style="color:#fff;">#${orderId}</strong>.</p>
            <div style="background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:20px;margin:20px 0;">
              <p style="color:#fff;font-size:14px;margin:4px 0;"><strong>Reason:</strong> ${reasonLabel || reason}</p>
              ${note ? `<p style="color:rgba(255,255,255,0.6);font-size:13px;margin:8px 0 0;"><strong>Note:</strong> ${note}</p>` : ''}
              ${upiId ? `<p style="color:rgba(255,255,255,0.6);font-size:13px;margin:8px 0 0;"><strong>UPI ID:</strong> ${upiId}</p>` : ''}
              <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:8px 0 0;">Order Total: ₹${order.totalPrice?.toLocaleString('en-IN')}</p>
              ${photoHtml}
            </div>
            <a href="${frontendUrl}/admin/returns" style="display:inline-block;margin-top:8px;padding:12px 24px;background:#C9A84C;color:#000;font-weight:600;text-decoration:none;border-radius:4px;font-size:13px;">Review in Admin Panel</a>
          </div>`,
                });
            } catch (e) { console.error('Admin email error:', e.message); }
        }

        // Confirm to customer
        try {
            await sendEmail({
                to: order.user.email, subject: `Return Request Received — Order #${orderId}`,
                html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;background:#111;color:#fff;padding:32px;border-radius:8px;">
          <h2 style="color:#C9A84C;font-weight:300;">Return Request Submitted</h2>
          <p style="color:rgba(255,255,255,0.6);font-size:14px;">Hi ${order.user.name}, we've received your return request for order <strong style="color:#fff;">#${orderId}</strong>.</p>
          <div style="background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:20px;margin:20px 0;">
            <p style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px;">Return Reason</p>
            <p style="color:#fff;font-size:14px;margin:0;">${reasonLabel || reason}</p>
            ${note ? `<p style="color:rgba(255,255,255,0.5);font-size:13px;margin:8px 0 0;">${note}</p>` : ''}
          </div>
          <p style="color:rgba(255,255,255,0.5);font-size:13px;">The seller will review and respond within <strong style="color:#fff;">24–48 business hours</strong>. You'll receive an email once a decision is made.</p>
        </div>`,
            });
        } catch (e) { console.error('Customer confirmation email error:', e.message); }

        res.status(200).json({ success: true, message: 'Return request submitted. Seller and admin have been notified.' });
    } catch (err) {
        console.error('requestReturn error:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════════
// PUT /api/orders/:id/return  — seller/admin approves or rejects
// ═══════════════════════════════════════════════════════════════════
const handleReturn = async (req, res) => {
    try {
        const { action, note } = req.body;
        if (!['approve', 'reject'].includes(action))
            return res.status(400).json({ message: 'action must be "approve" or "reject"' });

        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.orderStatus !== 'Return Requested')
            return res.status(400).json({ message: 'No pending return request on this order' });

        const isApproved = action === 'approve';
        const newStatus = isApproved ? 'Return Approved' : 'Return Rejected';
        const refundAmount = isApproved ? order.totalPrice : 0;
        const orderId = order._id.toString().slice(-8).toUpperCase();
        const frontendUrl = process.env.FRONTEND_URL || 'https://videstore.onrender.com';

        order.orderStatus = newStatus;
        order.returnRequest.status = isApproved ? 'Approved' : 'Rejected';
        order.returnRequest.resolvedAt = new Date();
        order.returnRequest.resolvedBy = req.user._id;
        order.returnRequest.resolutionNote = note || '';
        if (isApproved) {
            order.returnRequest.refundAmount = refundAmount;
            order.returnRequest.refundStatus = 'Pending';
            order.refundAmount = refundAmount;
            order.refundStatus = 'Pending';
            order.payoutEligible = false;
        }
        order.statusHistory.push({
            status: newStatus, timestamp: new Date(),
            message: `${isApproved ? 'Return approved' : 'Return rejected'} by ${req.user.role}. ${note || ''}`.trim(),
            updatedBy: req.user._id,
        });
        await order.save();

        await createNotification({
            recipient: order.user._id, type: 'return_update',
            title: isApproved ? 'Return Approved ✓' : 'Return Rejected',
            message: isApproved
                ? `Return for order #${orderId} approved. Refund of ₹${refundAmount.toLocaleString('en-IN')} will be processed within 5-7 business days.`
                : `Your return for order #${orderId} was not approved. ${note || ''}`.trim(),
            orderId: order._id, isRead: false,
        });

        try {
            if (isApproved) {
                await sendEmail({
                    to: order.user.email, subject: `Return Approved — Order #${orderId}`,
                    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;background:#111;color:#fff;padding:32px;border-radius:8px;">
            <h2 style="color:#4ade80;font-weight:300;">Return Approved ✓</h2>
            <p style="color:rgba(255,255,255,0.6);font-size:14px;">Hi ${order.user.name}, your return for order <strong style="color:#fff;">#${orderId}</strong> has been approved.</p>
            <div style="background:#0a0a0a;border:1px solid rgba(74,222,128,0.2);border-radius:8px;padding:20px;margin:20px 0;">
              <p style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px;">Refund Details</p>
              <p style="color:#4ade80;font-size:22px;font-weight:700;margin:0 0 4px;">₹${refundAmount.toLocaleString('en-IN')}</p>
              <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0;">Credited within 5–7 business days</p>
              ${note ? `<p style="color:rgba(255,255,255,0.5);font-size:13px;margin:12px 0 0;padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);">${note}</p>` : ''}
            </div>
            <p style="color:rgba(255,255,255,0.4);font-size:12px;">A free pickup will be arranged from your delivery address.</p>
            <a href="${frontendUrl}/orders/${order._id}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#C9A84C;color:#000;font-weight:600;text-decoration:none;border-radius:4px;font-size:13px;">View Order</a>
          </div>`,
                });
            } else {
                await sendEmail({
                    to: order.user.email, subject: `Return Request Update — Order #${orderId}`,
                    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;background:#111;color:#fff;padding:32px;border-radius:8px;">
            <h2 style="color:#f87171;font-weight:300;">Return Not Approved</h2>
            <p style="color:rgba(255,255,255,0.6);font-size:14px;">Hi ${order.user.name}, we reviewed your return for order <strong style="color:#fff;">#${orderId}</strong>. Unfortunately it was not approved.</p>
            ${note ? `<div style="background:#0a0a0a;border:1px solid rgba(248,113,113,0.2);border-radius:8px;padding:16px;margin:20px 0;"><p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0;">${note}</p></div>` : ''}
            <p style="color:rgba(255,255,255,0.4);font-size:13px;">For queries email <a href="mailto:vibestore2027@gmail.com" style="color:#C9A84C;">vibestore2027@gmail.com</a></p>
            <a href="${frontendUrl}/orders/${order._id}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#C9A84C;color:#000;font-weight:600;text-decoration:none;border-radius:4px;font-size:13px;">View Order</a>
          </div>`,
                });
            }
        } catch (e) { console.error('Customer return email error:', e.message); }

        res.status(200).json({
            success: true,
            message: isApproved ? `Return approved. Refund of ₹${refundAmount.toLocaleString('en-IN')} will be processed.` : 'Return request rejected.',
            order,
        });
    } catch (err) {
        console.error('handleReturn error:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════════
// GET /api/orders/returns/all  — admin/seller view
// ═══════════════════════════════════════════════════════════════════
const getAllReturns = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = { returnRequest: { $exists: true } };
        if (status) query['returnRequest.status'] = status;
        
        const sellerRoles = ['seller', 'seller_owner', 'seller_staff'];
        if (sellerRoles.includes(req.user.role)) {
            query['orderItems.sellerId'] = req.user.sellerAccountId;
        }

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .populate('user', 'name email')
            .populate('orderItems.seller', 'name email')
            .sort({ 'returnRequest.requestedAt': -1 })
            .skip(skip).limit(Number(limit));

        res.json({ success: true, orders, total, pages: Math.ceil(total / Number(limit)) });
    } catch (err) {
        console.error('getAllReturns error:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};

module.exports = { requestReturn, handleReturn, getAllReturns };