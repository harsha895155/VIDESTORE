// pages/ReturnRequestPage.jsx
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheck, FiUpload, FiX, FiAlertCircle, FiRotateCcw, FiShoppingBag, FiInfo } from 'react-icons/fi';
import BackButton from '../components/common/BackButton';

const RETURN_REASONS = [
    { id: 'wrong_size', label: "Wrong Size / Doesn't Fit", desc: 'Too big, too small, or sizing is off' },
    { id: 'wrong_item', label: 'Wrong Item Received', desc: 'I received a different product than ordered' },
    { id: 'defective', label: 'Defective / Damaged Product', desc: 'Arrived with tears, holes, or defects' },
    { id: 'poor_quality', label: 'Poor Quality', desc: "Material quality doesn't match the listing" },
    { id: 'not_as_desc', label: 'Not as Described', desc: 'Looks different from photos or description' },
    { id: 'color_mismatch', label: 'Color / Shade Mismatch', desc: 'Color received differs from what was shown' },
    { id: 'missing_parts', label: 'Incomplete / Missing Parts', desc: 'Parts of the product or accessories missing' },
    { id: 'changed_mind', label: 'Changed My Mind', desc: 'I no longer need this item' },
    { id: 'duplicate', label: 'Ordered by Mistake / Duplicate', desc: 'I accidentally placed a duplicate order' },
    { id: 'late_delivery', label: 'Arrived Too Late', desc: 'Item arrived much later than expected' },
];

export default function ReturnRequestPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedReason, setSelected] = useState('');
    const [additionalNote, setNote] = useState('');
    const [upiId, setUpiId] = useState('');
    const [images, setImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        orderAPI.getById(id)
            .then(res => setOrder(res.order))
            .catch(() => toast.error('Could not load order'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleImageAdd = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 4) { toast.error('Max 4 images'); return; }
        const newImgs = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
        setImages(prev => [...prev, ...newImgs]);
        e.target.value = '';
    };

    const removeImage = (idx) => {
        setImages(prev => { URL.revokeObjectURL(prev[idx].preview); return prev.filter((_, i) => i !== idx); });
    };

    const handleSubmit = async () => {
        if (!selectedReason) { toast.error('Please select a return reason'); return; }
        if (!upiId.trim()) { toast.error('Please provide a UPI ID for refund'); return; }
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('reason', selectedReason);
            formData.append('reasonLabel', RETURN_REASONS.find(r => r.id === selectedReason)?.label || '');
            formData.append('note', additionalNote);
            formData.append('upiId', upiId);
            images.forEach(img => formData.append('images', img.file));
            await orderAPI.requestReturn(id, formData);
            setSubmitted(true);
            toast.success('Return request submitted!');
        } catch (err) {
            toast.error(err.message || 'Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
            <div className="max-w-3xl mx-auto px-6 py-20 space-y-8">
                <div className="h-6 w-32 bg-white/5 rounded-full animate-pulse" />
                <div className="h-48 bg-[var(--card)] rounded-[2rem] border border-[var(--b)] animate-pulse" />
                <div className="h-96 bg-[var(--card)] rounded-[2rem] border border-[var(--b)] animate-pulse" />
            </div>
        </div>
    );

    if (!order) return (
        <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--bg)' }}>
            <div className="bg-[var(--card)] rounded-[2rem] border border-[var(--b)] shadow-2xl p-12 text-center max-w-md w-full">
                <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                    <FiAlertCircle size={40} className="text-red-500" />
                </div>
                <h2 className="serif text-3xl font-black text-[var(--t)] mb-4">Order Not Found</h2>
                <p className="text-[var(--tm)] font-medium leading-relaxed mb-10">
                    We couldn't find this order in your account history.
                </p>
                <Link to="/orders" className="h-14 px-10 bg-[var(--p)] text-black rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center">
                    Back to Orders
                </Link>
            </div>
        </div>
    );

    if (submitted) return (
        <div className="min-h-screen flex items-center justify-center px-6 py-20" style={{ backgroundColor: 'var(--bg)' }}>
            <div className="bg-[var(--card)] rounded-[2rem] border border-[var(--b)] shadow-2xl p-12 text-center max-w-xl w-full relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--p)]/10 rounded-full blur-[60px]" />
                
                <div className="relative z-10">
                    <div className="w-24 h-24 bg-[var(--p)]/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <FiCheck size={44} className="text-[var(--p)]" />
                    </div>
                    <p className="text-[10px] font-black text-[var(--p)] uppercase tracking-[0.2em] mb-3">Request Submitted</p>
                    <h2 className="serif text-4xl font-black text-[var(--t)] mb-6">We've Received It!</h2>
                    <p className="text-[var(--tm)] font-medium leading-relaxed mb-4">
                        Your return request for order <span className="text-[var(--t)] font-black">#{order._id.slice(-8).toUpperCase()}</span> has been sent for review.
                    </p>
                    <p className="text-[var(--tl)] font-bold text-[9px] uppercase tracking-widest mb-10">
                        Check your email for updates within 24-48 hours.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link to="/orders" className="h-14 px-10 bg-[var(--p)] text-black rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gold/20 flex items-center gap-2">
                            My Orders
                        </Link>
                        <Link to="/" className="h-14 px-10 bg-[var(--bg-alt)] text-[var(--t)] rounded-xl font-black text-xs uppercase tracking-widest border border-[var(--b)] hover:bg-[var(--card)] transition-all flex items-center gap-2">
                            Go Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

    const inputClass = "w-full bg-[var(--bg-alt)] border-2 border-[var(--b)] rounded-2xl px-5 text-sm font-bold text-[var(--t)] focus:border-[var(--p)] transition-all outline-none placeholder:opacity-30";

    return (
        <div className="min-h-screen py-0 px-4 sm:px-6" style={{ backgroundColor: 'var(--bg)' }}>
            <div className="max-w-[1440px] mx-auto">

                <Link to={`/orders/${id}`}
                    className="inline-flex items-center gap-2 text-[10px] font-black text-[var(--tl)] uppercase tracking-widest hover:text-[var(--p)] transition-colors mb-4">
                    <FiArrowLeft size={16} /> Back to Order Details
                </Link>

                <div className="mb-4">
                    <p className="text-[10px] font-black text-[var(--p)] uppercase tracking-[0.3em] mb-4">Support Center</p>
                    <h1 className="serif text-5xl md:text-6xl font-black text-[var(--t)] mb-4">Request a Return</h1>
                    <p className="text-[var(--tm)] font-bold uppercase tracking-tighter text-xs">
                        Order #{order._id.slice(-8).toUpperCase()} &nbsp;·&nbsp;
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>

                <div className="space-y-10">
                    <div className="bg-[var(--card)] rounded-[2rem] border border-[var(--b)] p-8">
                        <p className="text-[9px] font-black text-[var(--tl)] uppercase tracking-[0.25em] mb-8">Items to be Returned</p>
                        <div className="space-y-6">
                            {order.orderItems?.map(item => (
                                <div key={item._id} className="flex items-center gap-8">
                                    <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded-xl border border-[var(--b)]" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-[var(--t)] truncate">{item.name}</p>
                                        <p className="text-[10px] font-black text-[var(--tl)] mt-1 uppercase tracking-widest">
                                            {item.size && `Size: ${item.size}`}{item.color && ` • Color: ${item.color}`}{` • Qty: ${item.quantity}`}
                                        </p>
                                    </div>
                                    <p className="text-sm font-black text-[var(--p)]">₹{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[var(--card)] rounded-[3rem] border border-[var(--b)] shadow-2xl p-8 sm:p-14 space-y-16">
                        
                        {/* STEP 1 — Reason */}
                        <div>
                            <div className="flex items-center gap-5 mb-10">
                                <div className="w-12 h-12 bg-[var(--p)] text-black rounded-2xl flex items-center justify-center font-black text-sm shadow-xl shadow-gold/10">1</div>
                                <h2 className="serif text-3xl font-black text-[var(--t)]">Why are you returning?</h2>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-5">
                                {RETURN_REASONS.map((reason) => {
                                    const active = selectedReason === reason.id;
                                    return (
                                        <button 
                                            key={reason.id} 
                                            onClick={() => setSelected(reason.id)}
                                            className={`group text-left p-6 rounded-[2rem] transition-all border-2 ${
                                                active ? 'bg-[var(--p)]/5 border-[var(--p)]' : 'bg-[var(--bg-alt)] border-[var(--b)] hover:border-[var(--tl)]'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className={`text-sm font-black mb-1.5 transition-colors ${active ? 'text-[var(--p)]' : 'text-[var(--t)]'}`}>{reason.label}</p>
                                                    <p className="text-[11px] font-bold text-[var(--tl)] leading-relaxed">{reason.desc}</p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all border-2 ${
                                                    active ? 'bg-[var(--p)] border-[var(--p)]' : 'border-[var(--b-inner)] group-hover:border-[var(--tl)]'
                                                }`}>
                                                    {active && <FiCheck size={12} className="text-black" strokeWidth={4} />}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* STEP 2 — Photos */}
                        <div>
                            <div className="flex items-center gap-5 mb-3">
                                <div className="w-12 h-12 bg-[var(--p)] text-black rounded-2xl flex items-center justify-center font-black text-sm shadow-xl shadow-gold/10">2</div>
                                <h2 className="serif text-3xl font-black text-[var(--t)]">Evidence Photos</h2>
                            </div>
                            <p className="text-[var(--tl)] font-bold text-xs ml-16 mb-10">Photos help us process your request faster (Max 4)</p>

                            <div className="flex gap-5 flex-wrap ml-16">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative w-28 h-36 rounded-2xl overflow-hidden border border-[var(--b)] shadow-lg group">
                                        <img src={img.preview} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        <button onClick={() => removeImage(idx)}
                                            className="absolute top-2 right-2 w-8 h-8 bg-black/80 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                ))}
                                {images.length < 4 && (
                                    <label className="w-28 h-36 bg-[var(--bg-alt)] border-2 border-dashed border-[var(--b)] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[var(--p)] hover:bg-[var(--p)]/5 transition-all text-[var(--tl)] group">
                                        <FiUpload size={24} className="mb-3 group-hover:text-[var(--p)]" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Add Photo</span>
                                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* STEP 3 — Note & Refund */}
                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <div className="flex items-center gap-5 mb-10">
                                    <div className="w-12 h-12 bg-[var(--p)] text-black rounded-2xl flex items-center justify-center font-black text-sm shadow-xl shadow-gold/10">3</div>
                                    <h2 className="serif text-3xl font-black text-[var(--t)]">Any notes?</h2>
                                </div>
                                <textarea 
                                    value={additionalNote} 
                                    onChange={e => setNote(e.target.value)} 
                                    maxLength={500} 
                                    rows={4}
                                    placeholder="Tell us more about the issue..."
                                    className={`${inputClass} py-6 h-48 resize-none`}
                                />
                                <div className="flex justify-between mt-4 px-2">
                                    <p className="text-[9px] font-black text-[var(--tl)] uppercase tracking-widest">Optional details</p>
                                    <p className="text-[9px] font-black text-[var(--tl)] uppercase tracking-widest">{additionalNote.length}/500</p>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-5 mb-10">
                                    <div className="w-12 h-12 bg-[var(--p)] text-black rounded-2xl flex items-center justify-center font-black text-sm shadow-xl shadow-gold/10">4</div>
                                    <h2 className="serif text-3xl font-black text-[var(--t)]">Refund Method</h2>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[9px] font-black text-[var(--tl)] uppercase tracking-widest mb-3 block ml-1">Enter UPI ID</label>
                                        <input 
                                            type="text" 
                                            value={upiId} 
                                            onChange={e => setUpiId(e.target.value)}
                                            placeholder="yourname@upi"
                                            className={`${inputClass} h-16`}
                                        />
                                    </div>
                                    <div className="bg-[var(--p)]/5 rounded-2xl p-6 flex gap-4 border border-[var(--p)]/10">
                                        <FiInfo className="text-[var(--p)] flex-shrink-0 mt-1" size={20} />
                                        <p className="text-xs font-bold text-[var(--tm)] leading-relaxed">
                                            Refund will be credited within 7 days after the item is picked up and verified.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary & Submit */}
                        <div className="pt-10">
                            <div className="bg-gradient-to-br from-[#111] to-[#040404] rounded-[2.5rem] p-8 sm:p-12 text-white relative overflow-hidden border border-[var(--b)]">
                                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                    <FiRotateCcw size={140} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-start gap-5 mb-10">
                                        <FiRotateCcw className="text-[var(--p)] mt-1.5 flex-shrink-0" size={24} />
                                        <p className="text-sm font-bold text-[var(--tl)] leading-relaxed">
                                            Once submitted, a pickup will be arranged within 48 hours for valid requests. Ensure all original tags and packaging are intact.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleSubmit} 
                                        disabled={submitting || !selectedReason || !upiId.trim()}
                                        className="w-full h-16 bg-[var(--p)] text-black rounded-2xl font-black text-xs uppercase tracking-[0.25em] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl shadow-gold/20"
                                    >
                                        {submitting ? 'Processing Request...' : 'Submit Return Request'}
                                    </button>
                                    <p className="text-center mt-8 text-[9px] font-black text-[var(--tl)] uppercase tracking-[0.2em]">
                                        By submitting, you agree to our <Link to="/refund-policy" className="text-[var(--p)] hover:underline">Return & Refund Policy</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}