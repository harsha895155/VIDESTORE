import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productAPI, uploadAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUpload, FiX, FiSave, FiVideo, FiLayers, FiActivity, FiShield, FiTag, FiBox, FiTrendingUp, FiCheckCircle, FiRefreshCw, FiChevronDown, FiDollarSign, FiInfo } from 'react-icons/fi';

const CATEGORIES = ['Men', 'Women', 'Streetwear', 'Accessories', 'Kids'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const SUB_CATS = {
  Men: ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Ethnic Wear', 'Sportswear'],
  Women: ['Tops', 'Dresses', 'Jeans', 'Sarees', 'Kurtis', 'Skirts', 'Jackets'],
  Streetwear: ['Hoodies', 'Oversized Tees', 'Joggers', 'Caps', 'Sneakers'],
  Accessories: ['Bags', 'Belts', 'Watches', 'Sunglasses', 'Jewelry', 'Scarves'],
  Kids: ['Boys', 'Girls', 'Infants', 'School Wear', 'Party Wear'],
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const [form, setForm] = useState({
    name: '', description: '', price: '', discountPrice: '',
    category: 'Men', subCategory: '', brand: 'VideStore',
    stock: '', material: '', careInstructions: '',
    sizes: [], colors: [],
    isFeatured: false, isNewArrival: false, isBestSeller: false,
    tags: '',
  });
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [colorInput, setColorInput] = useState({ name: '', hex: '#000000' });

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    productAPI.getById(id)
      .then(res => {
        const p = res.product;
        setForm({
          name: p.name || '',
          description: p.description || '',
          price: p.price || '',
          discountPrice: p.discountPrice || '',
          category: p.category || 'Men',
          subCategory: p.subCategory || '',
          brand: p.brand || 'VideStore',
          stock: p.stock || '',
          material: p.material || '',
          careInstructions: p.careInstructions || '',
          sizes: p.sizes || [],
          colors: p.colors || [],
          isFeatured: p.isFeatured || false,
          isNewArrival: p.isNewArrival || false,
          isBestSeller: p.isBestSeller || false,
          tags: (p.tags || []).join(', '),
        });
        setImages(p.images || []);
        setVideos(p.videos || []);
      })
      .catch(() => toast.error('Product not found'))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const toggle = k => () => setForm(p => ({ ...p, [k]: !p[k] }));

  const toggleSize = (size) => setForm(p => ({
    ...p,
    sizes: p.sizes.includes(size) ? p.sizes.filter(s => s !== size) : [...p.sizes, size],
  }));

  const addColor = () => {
    if (!colorInput.name.trim()) return;
    setForm(p => ({ ...p, colors: [...p.colors, { ...colorInput }] }));
    setColorInput({ name: '', hex: '#000000' });
  };
  const removeColor = (i) => setForm(p => ({ ...p, colors: p.colors.filter((_, idx) => idx !== i) }));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (images.length + files.length > 5) { toast.error('Max 5 images allowed'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const res = await uploadAPI.uploadImages(formData);
      setImages(p => [...p, ...(res.images || [])]);
      toast.success('Images uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (videos.length + files.length > 2) { toast.error('Max 2 videos allowed'); return; }
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('videos', f));
      const res = await uploadAPI.uploadVideos(formData);
      setVideos(p => [...p, ...(res.videos || [])]);
      toast.success('Videos uploaded');
    } catch { toast.error('Video upload failed'); }
    finally { setUploadingVideo(false); }
  };

  const removeImage = (i) => setImages(p => p.filter((_, idx) => idx !== i));
  const removeVideo = (i) => setVideos(p => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock || !form.description) {
      toast.error('Please fill all required fields'); return;
    }
    if (images.length === 0) { toast.error('Please upload at least one image'); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : 0,
        stock: Number(form.stock),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images,
        videos,
      };

      if (isEdit) {
        await productAPI.update(id, payload);
        toast.success('Product updated');
      } else {
        await productAPI.create(payload);
        toast.success('Product added');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally { setLoading(false); }
  };

  if (fetching) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-20 h-20 rounded-[32px] bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] mb-8 border border-[var(--p)]/10 shadow-inner">
         <FiRefreshCw className="animate-spin" size={32} />
      </div>
      <p className="text-[10px] font-black text-[var(--tl)] uppercase tracking-[0.25em] opacity-60">Synchronizing Asset Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between sticky top-0 z-10" 
        style={{ backgroundColor: 'var(--glass)', borderBottom: `1px solid var(--b)`, backdropFilter: 'blur(32px)' }}>
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-[14px] bg-[var(--p)] flex items-center justify-center text-black shadow-xl shadow-gold/20">
            <FiLayers size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FiShield size={12} className="text-[var(--p)]" />
              <p className="font-black text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--tm)' }}>Products</p>
            </div>
            <h1 className="font-body text-2xl font-black tracking-tighter uppercase" style={{ color: 'var(--t)' }}>
              {isEdit ? 'Edit' : 'Add New'}
            </h1>
          </div>
        </div>
        <Link to="/admin/products" className="font-bold text-[12px] px-5 py-3 bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl text-[var(--tm)] hover:bg-[var(--card-alt)] transition-all flex items-center gap-2 shadow-sm" style={{ textDecoration: 'none' }}>
          <FiArrowLeft size={16} /> Inventory
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-[1536px] mx-auto px-8 py-4">
        
        {/* Strategy Bar */}
        <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <div className="w-16 h-16 bg-[var(--p)]/5 rounded-2xl flex items-center justify-center text-[var(--p)] border border-[var(--p)]/10">
            <FiBox size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-[var(--t)] mb-1 m-0 tracking-tight">Product Details</h3>
            <p className="text-xs text-[var(--tl)] m-0 opacity-60 font-medium">
              Fill in the details below to list your product. Ensure price and stock are accurate.
            </p>
          </div>
          <div className="flex gap-4">
             <button type="submit" disabled={loading || uploading}
               className={`px-8 py-4 rounded-xl font-bold text-[12px] text-black transition-all flex items-center gap-3 ${loading ? 'bg-[var(--bg-alt)] text-[var(--tl)] opacity-40' : 'bg-[var(--p)] shadow-lg shadow-gold/20 hover:-translate-y-0.5 active:translate-y-0'}`}>
               {loading ? <FiRefreshCw className="animate-spin" size={16} /> : <FiSave size={16} />} 
               {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Product'}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">

          {/* ── Left Column: Configuration ── */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Core Parameters */}
            <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-6 shadow-sm">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] border border-[var(--p)]/10">
                    <FiActivity size={20} />
                  </div>
                  <h4 className="text-lg font-bold text-[var(--t)] m-0 tracking-tight">Basic Information</h4>
               </div>
               
               <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-3 px-1 opacity-60">Product Name *</label>
                    <input required value={form.name} onChange={set('name')} placeholder="e.g. Premium Techweave Overcoat"
                      className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl p-4 text-sm font-medium text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-sm" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-3 px-1 opacity-60">Description *</label>
                    <textarea required value={form.description} onChange={set('description')} rows={4}
                      placeholder="Enter product description here..."
                      className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl p-4 text-sm font-medium text-[var(--t)] focus:border-[var(--p)] outline-none transition-all resize-none shadow-sm leading-relaxed" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-3 px-1 opacity-60">Brand Signature</label>
                      <input value={form.brand} onChange={set('brand')}
                        className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl p-4 text-sm font-medium text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-3 px-1 opacity-60">Keywords</label>
                      <input value={form.tags} onChange={set('tags')} placeholder="e.g. techwear, winter"
                        className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl p-4 text-sm font-medium text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-3 px-1 opacity-60">Material Composition</label>
                      <input value={form.material} onChange={set('material')} placeholder="90% Wool, 10% Nylon"
                        className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl p-4 text-sm font-medium text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-3 px-1 opacity-60">Care Instructions</label>
                      <input value={form.careInstructions} onChange={set('careInstructions')} placeholder="e.g. Dry clean only"
                        className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl p-4 text-sm font-medium text-[var(--t)] focus:border-[var(--p)] outline-none transition-all shadow-sm" />
                    </div>
                  </div>
               </div>
            </div>

            {/* Media Synchronization */}
            <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-8 shadow-sm">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] border border-[var(--p)]/10">
                    <FiUpload size={20} />
                  </div>
                  <h4 className="text-lg font-bold text-[var(--t)] m-0 tracking-tight">Photos & Videos</h4>
               </div>

               <div className="space-y-12">
                  <div>
                    <p className="text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-6 opacity-40">Photos (Max 5)</p>
                    <div className="flex flex-wrap gap-4">
                      {images.map((img, i) => (
                        <div key={i} className="relative w-28 h-36 rounded-xl overflow-hidden border border-[var(--b)] shadow-sm group">
                           <img src={img.url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                           <button type="button" onClick={() => removeImage(i)}
                             className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center text-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                             <FiX size={14} />
                           </button>
                           {i === 0 && (
                             <div className="absolute bottom-0 left-0 right-0 py-1.5 bg-[var(--p)] text-[var(--bg)] text-[8px] font-bold uppercase tracking-widest text-center">Main</div>
                           )}
                        </div>
                      ))}
                      {images.length < 5 && (
                        <label className="w-28 h-36 rounded-xl border-2 border-dashed border-[var(--b)] bg-[var(--bg-alt)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--p)]/30 hover:bg-[var(--p)]/5 transition-all group">
                           <FiUpload size={20} className="text-[var(--p)] opacity-20 group-hover:opacity-60 transition-opacity" />
                           <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--tl)] opacity-20 group-hover:opacity-40 mt-2 text-center px-2">{uploading ? '...' : 'Add Photo'}</span>
                           <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="pt-8 border-t border-[var(--b)]">
                    <p className="text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-6 opacity-40">Videos (Max 2)</p>
                    <div className="flex flex-wrap gap-4">
                       {videos.map((vid, i) => (
                         <div key={i} className="relative w-56 h-32 rounded-xl overflow-hidden border border-[var(--b)] shadow-sm group">
                            <video src={vid.url} muted loop playsInline onMouseOver={e => e.target.play()} onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                              className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 pointer-events-none flex items-center justify-center">
                               <FiVideo size={28} className="text-white/60 group-hover:scale-105 transition-transform" />
                            </div>
                            <button type="button" onClick={() => removeVideo(i)}
                              className="absolute top-2 right-2 w-7 h-7 bg-[var(--card)] border border-[var(--b)] backdrop-blur-md rounded-lg flex items-center justify-center text-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <FiX size={14} />
                            </button>
                         </div>
                       ))}
                       {videos.length < 2 && (
                         <label className="w-56 h-32 rounded-xl border-2 border-dashed border-[var(--b)] bg-[var(--bg-alt)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--p)]/30 hover:bg-[var(--p)]/5 transition-all group">
                            <FiVideo size={20} className="text-[var(--p)] opacity-20 group-hover:opacity-60 transition-opacity" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--tl)] opacity-20 group-hover:opacity-40 mt-2">{uploadingVideo ? '...' : 'Add Video'}</span>
                            <input type="file" accept="video/*" multiple className="hidden" onChange={handleVideoUpload} disabled={uploadingVideo} />
                         </label>
                       )}
                    </div>
                     <div className="mt-6 p-4 bg-[var(--p)]/5 border border-[var(--p)]/15 rounded-xl flex gap-3 shadow-sm">
                         <FiInfo size={14} className="text-[var(--p)] shrink-0 mt-0.5" />
                         <p className="text-[11px] font-medium text-[var(--tm)] m-0">High quality videos improve the shopping experience.</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Spec Matrix */}
            <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-8 shadow-sm">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-[var(--p)]/5 flex items-center justify-center text-[var(--p)] border border-[var(--p)]/10">
                    <FiLayers size={20} />
                  </div>
                   <h4 className="text-lg font-bold text-[var(--t)] m-0 tracking-tight">Specifications</h4>
               </div>

               <div className="space-y-12">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-6 opacity-60">Available Sizes</label>
                    <div className="flex flex-wrap gap-3">
                      {SIZES.map(s => (
                        <button key={s} type="button" onClick={() => toggleSize(s)}
                          className={`px-6 py-3 text-[12px] font-bold rounded-lg border transition-all ${form.sizes.includes(s) ? 'bg-[var(--p)] text-black border-[var(--p)] shadow-md shadow-gold/20' : 'bg-[var(--bg-alt)] text-[var(--tl)] border-[var(--b)] hover:border-[var(--p)]/30 opacity-60'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-8 border-t border-[var(--b)]">
                    <label className="block text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-6 opacity-60">Available Colors</label>
                    <div className="flex flex-wrap gap-3 mb-8">
                      {form.colors.map((c, i) => (
                        <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[var(--bg-alt)] border border-[var(--b)] shadow-sm">
                          <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                          <span className="text-[11px] font-bold text-[var(--t)] uppercase tracking-widest">{c.name}</span>
                          <button type="button" onClick={() => removeColor(i)} className="text-[var(--d)] hover:opacity-70 ml-1 transition-all"><FiX size={14}/></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4 p-6 bg-[var(--bg-alt)] border border-[var(--b)] rounded-2xl max-w-xl">
                      <input value={colorInput.name} onChange={e => setColorInput(p => ({ ...p, name: e.target.value }))}
                        className="flex-1 w-full bg-[var(--card)] border border-[var(--b)] rounded-xl px-4 py-3 text-[13px] font-medium text-[var(--t)] focus:border-[#0EA5E9] outline-none transition-all shadow-sm" placeholder="Color Name" />
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <input type="color" value={colorInput.hex} onChange={e => setColorInput(p => ({ ...p, hex: e.target.value }))}
                          className="w-11 h-11 rounded-xl border-none p-1 bg-[var(--card)] cursor-pointer" />
                        <button type="button" onClick={addColor}
                          className="px-8 py-3 bg-[var(--p)] text-black text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-[var(--p)]/90 transition-all shadow-md shadow-gold/20">Add</button>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* ── Right Column: Economic & Logistics ── */}
          <div className="space-y-12">
            
            {/* Economic Layer */}
            <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-8 shadow-sm">
               <h4 className="text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-8 flex items-center gap-3 opacity-60"><FiDollarSign size={16} className="text-[var(--p)]"/> Pricing</h4>
               <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-3 px-1 opacity-60">Price (₹) *</label>
                    <input type="number" required value={form.price} onChange={set('price')}
                      className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl p-4 text-sm font-medium text-[var(--t)] focus:border-[#0EA5E9] outline-none transition-all shadow-sm" placeholder="999" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-3 px-1 opacity-60">Discounted Price (₹)</label>
                    <input type="number" value={form.discountPrice} onChange={set('discountPrice')}
                      className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl p-4 text-sm font-medium text-[var(--t)] focus:border-[#0EA5E9] outline-none transition-all shadow-sm" placeholder="799" />
                  </div>
                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between shadow-inner">
                     <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Margin</span>
                     <span className="text-xl font-bold text-emerald-500">₹{(form.price || 0) - (form.discountPrice || 0)}</span>
                  </div>
               </div>
            </div>

            {/* Logistics Layer */}
            <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-8 shadow-sm">
               <h4 className="text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-8 flex items-center gap-3 opacity-60"><FiBox size={16} className="text-[var(--p)]"/> Inventory</h4>
               <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-3 px-1 opacity-60">Stock Quantity *</label>
                    <input type="number" required value={form.stock} onChange={set('stock')}
                      className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl p-4 text-sm font-medium text-[var(--t)] focus:border-[#0EA5E9] outline-none transition-all shadow-sm" placeholder="50" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-3 px-1 opacity-60">Category</label>
                    <div className="relative">
                      <select value={form.category} onChange={set('category')}
                        className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl p-4 text-sm font-medium text-[var(--t)] focus:border-[#0EA5E9] outline-none transition-all appearance-none cursor-pointer shadow-sm">
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-3 px-1 opacity-60">Sub-Category</label>
                    <div className="relative">
                      <select value={form.subCategory} onChange={set('subCategory')}
                        className="w-full bg-[var(--bg-alt)] border border-[var(--b)] rounded-xl p-4 text-sm font-medium text-[var(--t)] focus:border-[#0EA5E9] outline-none transition-all appearance-none cursor-pointer shadow-sm">
                        <option value="">— Select Sub-Category —</option>
                        {(SUB_CATS[form.category] || []).map(s => <option key={s}>{s}</option>)}
                      </select>
                      <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                    </div>
                  </div>
               </div>
            </div>

            {/* Tactical Labels */}
            <div className="bg-[var(--card)] border border-[var(--b)] rounded-3xl p-8 shadow-sm">
                <h4 className="text-[11px] font-bold text-[var(--tm)] uppercase tracking-widest mb-6 flex items-center gap-3 opacity-60"><FiTag size={16} className="text-[var(--p)]"/> Badges</h4>
               <div className="space-y-4">
                {[
                  { key: 'isFeatured', label: 'Featured Product', icon: FiStar },
                  { key: 'isNewArrival', label: 'New Arrival', icon: FiTrendingUp },
                  { key: 'isBestSeller', label: 'Best Seller', icon: FiCheckCircle },
                ].map(({ key, label, icon: Icon }) => (
                  <button key={key} type="button" onClick={toggle(key)}
                    className={`w-full p-5 rounded-2xl border transition-all flex items-center justify-between group ${form[key] ? 'bg-[var(--p)] border-[var(--p)] text-black shadow-md shadow-gold/20' : 'bg-[var(--bg-alt)] border-[var(--b)] text-[var(--tl)] hover:border-[var(--p)]/30'}`}>
                    <div className="flex items-center gap-3">
                       <Icon size={16} className={form[key] ? 'text-black' : 'text-[var(--p)] opacity-40 group-hover:opacity-100 transition-opacity'} />
                       <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
                    </div>
                    <div className={`w-9 h-5 rounded-full relative transition-all ${form[key] ? 'bg-black/20' : 'bg-[var(--bg)] shadow-inner border border-[var(--b)]'}`}>
                       <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${form[key] ? 'left-[20px]' : 'left-1'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Institutional Compliance */}
            <div className="rounded-3xl p-8 shadow-xl relative overflow-hidden group border border-[var(--b)]" style={{ backgroundColor: 'var(--card-alt)' }}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--p)]/5 rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:scale-150 duration-700" />
               <FiShield size={80} className="absolute -bottom-6 -right-6 opacity-5 group-hover:scale-105 group-hover:opacity-10 transition-all duration-700 text-[var(--p)]" />
                <h4 className="text-[11px] font-bold uppercase tracking-widest mb-4 opacity-40" style={{ color: 'var(--tm)' }}>Store Policy</h4>
               <p className="text-[12px] font-medium leading-relaxed m-0" style={{ color: 'var(--tm)' }}>
                  By publishing this product, you agree to our quality standards and store policies.
               </p>
               <div className="mt-8 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--p)] shadow-lg shadow-gold/50" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--p)] opacity-80">Admin Verified</span>
               </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}

function FiStar(props) {
  return (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );
}