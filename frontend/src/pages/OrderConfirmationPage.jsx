import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderAPI } from '../services/api';
import { FiCheck, FiPackage, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => { 
    orderAPI.getById(id).then(res => setOrder(res.order)); 
  }, [id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-6 py-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-xl w-full"
      >
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[60px] opacity-50" />
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FiCheck size={44} className="text-green-500" />
            </div>

            <p className="text-xs font-black text-green-600 uppercase tracking-[0.2em] mb-3">Order Confirmed</p>
            <h1 className="serif text-4xl sm:text-5xl font-black text-gray-900 mb-6">Thank You!</h1>
            
            <p className="text-gray-500 font-medium leading-relaxed mb-6 max-w-sm mx-auto">
              Your order has been placed successfully. We're getting it ready for shipment!
            </p>

            {order && (
              <div className="bg-gray-50 rounded-3xl p-6 mb-10 inline-block w-full text-left">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200/50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Number</p>
                  <p className="text-sm font-black text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                  <p className="text-sm font-black text-indigo-600">₹{order.totalPrice?.toLocaleString()}</p>
                </div>
              </div>
            )}

            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10">
              A confirmation email is on its way to you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={`/orders/${id}`} className="h-14 px-10 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                <FiPackage /> Track My Order
              </Link>
              <Link to="/shop" className="h-14 px-10 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                <FiShoppingBag /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors">
            Back to Home <FiArrowRight />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
