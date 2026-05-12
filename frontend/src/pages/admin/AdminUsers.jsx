import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSearch, FiUser, FiShield, FiCheckCircle, FiTrash2, FiActivity, FiUsers, FiLock, FiUnlock, FiRefreshCw, FiExternalLink } from 'react-icons/fi';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({ page, limit: 20 });
      setUsers(res.users);
      setPagination({ pages: res.pages, total: res.total });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Initiate account termination? This operation is irreversible.')) return;
    try { 
      await userAPI.delete(id); 
      toast.success('Entity de-provisioned'); 
      fetchUsers(); 
    } catch { 
      toast.error('Termination failed'); 
    }
  };

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Escalate access for ${user.name} to ${newRole}?`)) return;
    try { 
      await userAPI.update(user._id, { role: newRole }); 
      toast.success(`Access level updated: ${newRole}`); 
      fetchUsers(); 
    } catch { 
      toast.error('Update failed'); 
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between sticky top-0 z-10"
        style={{ backgroundColor: 'var(--glass)', borderBottom: `1px solid var(--b)`, backdropFilter: 'blur(32px)' }}>
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-[14px] bg-[var(--p)] flex items-center justify-center text-[#040404] shadow-xl shadow-gold/20">
            <FiUsers size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FiShield size={12} className="text-[var(--p)]" />
              <p className="font-black text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--tm)' }}>User Management</p>
            </div>
            <h1 className="font-body text-2xl font-bold tracking-tighter uppercase" style={{ color: 'var(--t)' }}>Users</h1>
          </div>
        </div>
        <Link to="/admin" className="font-bold text-[11px] uppercase tracking-wider px-6 py-3 bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl text-[var(--tm)] hover:bg-[var(--card-alt)] transition-all flex items-center gap-2 shadow-sm" style={{ textDecoration: 'none' }}>
          <FiArrowLeft size={16} /> Dashboard
        </Link>
      </div>

      <div className="max-w-[1536px] mx-auto px-8 py-4">

        {/* Global Strategy Bar */}
        <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <div className="relative flex-1 w-full md:w-auto">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--p)] opacity-40" size={18} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl pl-14 pr-6 py-4 text-sm font-medium text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-sm" />
          </div>
          <div className="flex items-center gap-10 px-8 border-l border-[var(--b)] hidden md:flex">
             <div>
               <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--tl)] mb-1.5 opacity-40">Total Users</p>
               <p className="text-2xl font-bold text-[var(--t)] m-0 tracking-tight">{pagination.total || 0}</p>
             </div>
             <div>
               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--tl)] mb-2 opacity-40">Status</p>
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                 <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">Online</span>
               </div>
             </div>
          </div>
        </div>

        {/* Register Matrix */}
        <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-[var(--bg-alt)]/50 px-8 py-5 border-b border-[var(--b)]">
             <h4 className="text-[10px] font-bold text-[var(--tl)] uppercase tracking-[0.25em] m-0 flex items-center gap-3 opacity-60">
                <FiActivity size={14} className="text-[var(--p)]"/> User List
             </h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-[var(--bg-alt)]/30 border-b border-[var(--b)]">
                  {['User', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.3em] px-12 py-6 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--b)]">
                {loading ? (
                   [...Array(5)].map((_, i) => (
                    <tr key={i}><td colSpan="5" className="px-12 py-10"><div className="h-16 w-full rounded-2xl bg-[var(--bg-alt)] animate-pulse" /></td></tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="5" className="px-12 py-40 text-center text-[var(--tl)] font-black uppercase tracking-[0.3em] opacity-20">No users found</td></tr>
                ) : (
                  filtered.map(user => {
                    const isAdmin = user.role === 'admin';
                    const isSeller = user.role === 'seller';
                    return (
                      <tr key={user._id} className="hover:bg-[var(--bg-alt)] transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-[var(--bg-alt)] border border-[var(--b)] flex items-center justify-center text-[var(--tl)] group-hover:scale-110 group-hover:text-[var(--p)] transition-all duration-500 shadow-inner">
                               <FiUser size={18} className="text-[var(--p)]" />
                            </div>
                            <div>
                               <p className="text-base font-bold text-[var(--t)] m-0 tracking-tight mb-0.5">{user.name}</p>
                               <p className="text-[11px] font-medium text-[var(--tl)] m-0 opacity-40 uppercase">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm transition-all ${isAdmin ? 'bg-[var(--p)]/5 border-[var(--p)]/20 text-[var(--p)]' : isSeller ? 'bg-amber-600/5 border-amber-600/20 text-amber-600' : 'bg-[var(--bg-alt)] border-[var(--b)] text-[var(--tm)]'}`}>
                              {isAdmin ? <FiShield size={12}/> : isSeller ? <FiExternalLink size={12}/> : <FiUser size={12}/>}
                              <span className="text-[9px] font-bold uppercase tracking-widest">{user.role}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-sm font-bold text-[var(--t)] m-0 tracking-tight">{new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                           <p className="text-[9px] font-bold text-[var(--tl)] uppercase tracking-tight mt-1 opacity-40">Joined</p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30" />
                              <span className="text-[10px] font-bold text-[var(--t)] uppercase tracking-widest opacity-60">Active</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <button onClick={() => handleRoleToggle(user)} title={isAdmin ? "Make User" : "Make Admin"}
                                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all shadow-sm ${isAdmin ? 'bg-amber-500/5 border-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white' : 'bg-[var(--p)]/5 border-[var(--p)]/10 text-[var(--p)] hover:bg-[var(--p)] hover:text-[#040404]'}`}>
                                {isAdmin ? <FiLock size={16} /> : <FiUnlock size={16} />}
                              </button>
                              <button onClick={() => handleDelete(user._id)} title="Delete User"
                                className="w-10 h-10 rounded-xl bg-[var(--bg-alt)] border border-[var(--b)] flex items-center justify-center text-[var(--tl)] hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm">
                                <FiTrash2 size={16} />
                              </button>
                           </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation Matrix */}
        {pagination.pages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className={`w-14 h-14 rounded-[14px] flex items-center justify-center transition-all border ${page === 1 ? 'bg-[var(--bg-alt)] text-[var(--tl)] border-[var(--b)] opacity-30 cursor-not-allowed' : 'bg-[var(--card)] text-[var(--t)] border-[var(--b)] hover:border-[var(--p)] shadow-xl shadow-black/5'}`}>
              <FiArrowLeft size={20}/>
            </button>
            <div className="px-8 py-4 bg-[var(--card)] border border-[var(--b)] rounded-[18px] shadow-xl shadow-black/5 flex items-center gap-4">
              <span className="text-lg font-black text-[var(--p)] tracking-tighter serif">{page}</span>
              <span className="text-[10px] font-black text-[var(--tl)] uppercase tracking-widest opacity-40">/</span>
              <span className="text-lg font-black text-[var(--t)] tracking-tighter serif">{pagination.pages}</span>
            </div>
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
              className={`w-14 h-14 rounded-[14px] flex items-center justify-center transition-all border ${page === pagination.pages ? 'bg-[var(--bg-alt)] text-[var(--tl)] border-[var(--b)] opacity-30 cursor-not-allowed' : 'bg-[var(--card)] text-[var(--t)] border-[var(--b)] hover:border-[var(--p)] shadow-xl shadow-black/5'}`}>
              <FiArrowLeft size={20} className="rotate-180" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
