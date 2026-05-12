import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { FiUser, FiLock, FiShoppingBag, FiHeart, FiLogOut, FiEdit3, FiChevronRight, FiCheck, FiX, FiFileText, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { OrdersPage } from './OrdersPage';
import WishlistPage from './WishlistPage';

const PRIMARY = '#4F46E5';

export function ProfilePage() {
  const { user, logout, updateUser, isAdmin } = useAuth();
  const [tab, setTab] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const navItems = [
    { id: 'profile',  label: 'Account Details',   icon: FiUser,        action: () => setTab('profile'),  desc: 'Manage your personal information' },
    { id: 'password', label: 'Password & Security', icon: FiLock,        action: () => setTab('password'), desc: 'Update your password' },
    { id: 'orders',   label: 'My Orders',          icon: FiShoppingBag, action: () => setTab('orders'),   desc: 'Track and manage orders' },
    { id: 'wishlist', label: 'My Favorites',       icon: FiHeart,       action: () => setTab('wishlist'), desc: 'Your saved items' },
  ];

  return (
    <div className="min-h-screen py-0 px-4 sm:px-6" style={{ background: 'transparent' }}>
      <div className="max-w-[1440px] mx-auto">
        
        {/* Header Section */}
        <div className="mb-4">
          <h1 className="serif text-4xl font-black mb-1" style={{ color: 'var(--t)' }}>My Account</h1>
          <p style={{ color: 'var(--tm)' }}>Welcome back, <span style={{ color: 'var(--p)', fontWeight: '900' }}>{user?.name}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar / Navigation */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-[2rem] border shadow-sm overflow-hidden p-3 glass" style={{ borderColor: 'var(--b)' }}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                    tab === item.id ? 'bg-indigo-50/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    tab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/10 text-gray-400 group-hover:bg-white/20'
                  }`} style={{ backgroundColor: tab === item.id ? 'var(--p)' : '' }}>
                    <item.icon size={18} />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-black ${tab === item.id ? 'text-indigo-600' : ''}`} style={{ color: tab === item.id ? 'var(--p)' : 'var(--t)' }}>
                      {item.label}
                    </p>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest" style={{ color: 'var(--t)' }}>{item.id}</p>
                  </div>
                </button>
              ))}
              
              <div className="h-px bg-white/5 my-3 mx-4" />

              {isAdmin && (
                <Link to="/admin" className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-indigo-50/10 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FiActivity size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black" style={{ color: 'var(--t)' }}>Admin Console</p>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Management</p>
                  </div>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50/10 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50/10 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <FiLogOut size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black" style={{ color: 'var(--t)' }}>Logout</p>
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Sign Out</p>
                </div>
              </button>
            </div>

            {/* Legal Links Card */}
            <div className="rounded-[2rem] border shadow-sm p-6 glass" style={{ borderColor: 'var(--b)' }}>
              <h3 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--t)' }}>Legal & Information</h3>
              <div className="space-y-3">
                {[
                  { label: 'Privacy Policy', to: '/privacy-policy' },
                  { label: 'Terms of Service', to: '/terms-of-service' },
                  { label: 'Shipping & Returns', to: '/shipping-policy' }
                ].map((link) => (
                  <Link key={link.to} to={link.to} className="flex items-center justify-between text-sm font-bold opacity-70 hover:opacity-100 transition-colors py-1" style={{ color: 'var(--t)' }}>
                    {link.label}
                    <FiChevronRight size={14} className="opacity-30" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <div className="rounded-[2.5rem] border shadow-sm p-8 min-h-[400px] glass" style={{ borderColor: 'var(--b)' }}>
              {tab === 'profile' ? (
                <EditProfileForm user={user} updateUser={updateUser} onClose={() => setTab('')} />
              ) : tab === 'password' ? (
                <ChangePasswordForm onClose={() => setTab('')} />
              ) : tab === 'orders' ? (
                <OrdersPage />
              ) : tab === 'wishlist' ? (
                <WishlistPage />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6" style={{ color: 'var(--p)' }}>
                    <FiUser size={40} />
                  </div>
                  <h2 className="serif text-2xl font-black mb-3" style={{ color: 'var(--t)' }}>Your VideStore Profile</h2>
                  <p className="opacity-50 max-w-xs mx-auto font-medium leading-relaxed mb-8" style={{ color: 'var(--t)' }}>
                    Select an option from the sidebar to manage your account settings and view your activity.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <button onClick={() => navigate('/orders')} className="h-12 px-6 bg-white/10 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/10">
                      <FiShoppingBag /> View Orders
                    </button>
                    <button onClick={() => setTab('profile')} className="h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-colors flex items-center gap-2 text-white" style={{ background: 'var(--p)' }}>
                      <FiEdit3 /> Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function EditProfileForm({ user, updateUser, onClose }) {
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.user);
      toast.success('Profile updated successfully');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const inputClass = "w-full h-14 bg-white/5 border-2 border-transparent rounded-2xl px-5 text-sm font-bold text-white focus:border-[var(--p)] transition-all outline-none focus:bg-white/10";

  return (
    <div className="max-w-md">
      <div className="flex items-center justify-between mb-8">
        <h3 className="serif text-3xl font-black text-white">Edit Profile</h3>
        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
          <FiX size={20} className="text-white/40" />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block ml-1">Full Name</label>
          <input 
            type="text" 
            value={form.name} 
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className={inputClass}
            placeholder="Your Name"
            required
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block ml-1">Phone Number</label>
          <input 
            type="tel" 
            value={form.phone} 
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            className={inputClass}
            placeholder="10-digit number"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block ml-1">Email Address</label>
          <div className="w-full h-14 bg-white/5 border-2 border-transparent rounded-2xl px-5 flex items-center text-sm font-bold text-white/40 cursor-not-allowed">
            {user?.email}
          </div>
          <p className="text-[10px] font-bold text-white/20 mt-2 ml-1 italic">Email cannot be changed</p>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="flex-1 h-14 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'var(--p)' }}
          >
            {saving ? 'Saving...' : <><FiCheck /> Save Changes</>}
          </button>
          <button 
            type="button" 
            onClick={onClose}
            className="px-8 h-14 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function ChangePasswordForm({ onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword.length < 6) { setError('Minimum 6 characters required'); return; }
    if (form.newPassword !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated successfully');
      onClose();
    } catch (err) {
      setError(err.message || 'Check your current password');
    } finally { setSaving(false); }
  };

  const inputClass = "w-full h-14 bg-white/5 border-2 border-white/5 rounded-2xl px-5 text-sm font-bold transition-all outline-none focus:border-[var(--p)]";

  return (
    <div className="max-w-md">
      <div className="flex items-center justify-between mb-8">
        <h3 className="serif text-3xl font-black text-white">Update Security</h3>
        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
          <FiX size={20} className="text-white/40" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
          <FiLock className="text-red-500" />
          <p className="text-sm font-bold text-red-500">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block ml-1">Current Password</label>
          <input 
            type="password" 
            value={form.currentPassword} 
            onChange={e => { setForm(p => ({ ...p, currentPassword: e.target.value })); setError(''); }}
            className={inputClass}
            required
          />
        </div>

        <div className="h-px bg-white/5 my-2" />

        <div>
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block ml-1">New Password</label>
          <input 
            type="password" 
            value={form.newPassword} 
            onChange={e => { setForm(p => ({ ...p, newPassword: e.target.value })); setError(''); }}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block ml-1">Confirm New Password</label>
          <input 
            type="password" 
            value={form.confirmPassword} 
            onChange={e => { setForm(p => ({ ...p, confirmPassword: e.target.value })); setError(''); }}
            className={inputClass}
            required
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="flex-1 h-14 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'var(--p)' }}
          >
            {saving ? 'Updating...' : <><FiCheck /> Update Password</>}
          </button>
          <button 
            type="button" 
            onClick={onClose}
            className="px-8 h-14 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;