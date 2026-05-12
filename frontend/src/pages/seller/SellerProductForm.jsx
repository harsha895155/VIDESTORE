import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productAPI, uploadAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiSave, FiX, FiImage, FiChevronDown, FiCheck,
  FiUpload, FiStar, FiZap, FiAward, FiVideo, FiInfo, FiEdit2, FiRefreshCw,
} from 'react-icons/fi';
import { CATEGORIES, getSubCategoryNames, getGroupedSubCategories } from '../../constants/categories';

const GOLD = 'var(--p)';
const SKY = '#0EA5E9';
const BG = 'var(--bg)';
const CARD = 'var(--card)';
const BORDER = 'var(--b)';

// ── Presets ──────────────────────────────────────────────────────────────────
const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const PRESET_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Navy', hex: '#1E3A5F' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Brown', hex: '#92400E' },
  { name: 'Beige', hex: '#D4B896' },
  { name: 'Maroon', hex: '#7F1D1D' },
  { name: 'Khaki', hex: '#BDB76B' },
];

// ── Default size measurements (same as ProductDetailPage uses as fallback) ──
const DEFAULT_SIZE_MEASUREMENTS = {
  XS: { chest: '32–33"', waist: '24–25"', hips: '34–35"', length: '25"' },
  S: { chest: '34–35"', waist: '26–27"', hips: '36–37"', length: '26"' },
  M: { chest: '36–37"', waist: '28–29"', hips: '38–39"', length: '27"' },
  L: { chest: '38–40"', waist: '30–32"', hips: '40–42"', length: '28"' },
  XL: { chest: '41–43"', waist: '33–35"', hips: '43–45"', length: '29"' },
  XXL: { chest: '44–46"', waist: '36–38"', hips: '46–48"', length: '30"' },
  'Free Size': { chest: '32–42"', waist: '24–36"', hips: '34–46"', length: 'Adjustable' },
};

const MEASUREMENT_FIELDS = [
  { key: 'chest', label: 'Chest', placeholder: 'e.g. 36–37"' },
  { key: 'waist', label: 'Waist', placeholder: 'e.g. 28–29"' },
  { key: 'hips', label: 'Hips', placeholder: 'e.g. 38–39"' },
  { key: 'length', label: 'Length', placeholder: 'e.g. 27"' },
];

const FIXED_FEE = (price) => {
  if (price <= 500) return 20;
  if (price <= 1000) return 30;
  if (price <= 5000) return 40;
  if (price <= 10000) return 80;
  if (price <= 50000) return 120;
  if (price <= 100000) return 150;
  return 200;
};
const calcEarnings = (price) => {
  const p = Number(price) || 0;
  const commission = Math.round(p * 0.10);
  const fixed = FIXED_FEE(p);
  return { commission, fixed, earnings: p - commission - fixed };
};
const inp = {
  width: '100%', boxSizing: 'border-box', backgroundColor: 'var(--bg-alt)',
  border: '1px solid var(--b)', borderRadius: '10px',
  padding: '12px 16px', color: 'var(--t)', fontSize: '13px',
  outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s',
};
const lbl = {
  display: 'block', color: 'var(--tm)', fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.05em', textTransform: 'uppercase',
  marginBottom: '6px', fontFamily: 'inherit',
};

/* ── Image Uploader ──────────────────────────────────────────────────────── */
function ImageUploader({ images, onChange }) {
  const [uploading, setUploading] = useState(false);
  const getUrl = (img) => (typeof img === 'string' ? img : img?.url || '');

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const res = await uploadAPI.uploadImages(formData);
      onChange([...images, ...res.images]);
      toast.success(`${res.images.length} image(s) uploaded!`);
    } catch {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index) => onChange(images.filter((_, i) => i !== index));

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
        {images.map((img, i) => (
          <div key={i} style={{
            position: 'relative', width: '80px', height: '90px',
            border: `1px solid ${i === 0 ? GOLD + '60' : BORDER}`,
            borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--bg-alt)', flexShrink: 0,
          }}>
            <img src={getUrl(img)} alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.style.display = 'none'; }} />
            {i === 0 && (
              <span style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                backgroundColor: GOLD, color: '#000', fontSize: '8px',
                fontWeight: 700, textAlign: 'center', padding: '2px', fontFamily: 'inherit',
              }}>MAIN</span>
            )}
            <button type="button" onClick={() => removeImage(i)}
              style={{
                position: 'absolute', top: '3px', right: '3px',
                width: '18px', height: '18px', borderRadius: '50%',
                backgroundColor: '#ef4444', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', opacity: 0, transition: 'opacity 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '1'}
              onMouseOut={e => e.currentTarget.style.opacity = '0'}
            >
              <FiX size={10} style={{ color: '#fff' }} />
            </button>
          </div>
        ))}
        <label style={{
          width: '80px', height: '90px', flexShrink: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          border: `2px dashed ${uploading ? GOLD + '40' : BORDER}`, borderRadius: '6px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          backgroundColor: 'var(--bg-alt)', transition: 'border-color 0.2s',
        }}
          onMouseOver={e => { if (!uploading) e.currentTarget.style.borderColor = GOLD; }}
          onMouseOut={e => { if (!uploading) e.currentTarget.style.borderColor = BORDER; }}
        >
          <input type="file" multiple accept="image/*" style={{ display: 'none' }}
            onChange={handleFileChange} disabled={uploading} />
          {uploading ? (
            <>
              <div style={{
                width: '20px', height: '20px', border: `2px solid ${GOLD}`,
                borderTopColor: 'transparent', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite', marginBottom: '4px',
              }} />
              <span style={{ color: GOLD, fontSize: '9px', fontFamily: 'inherit' }}>Uploading</span>
            </>
          ) : (
            <>
              <FiUpload size={18} style={{ color: 'var(--tl)', marginBottom: '4px' }} />
              <span style={{ color: 'var(--tl)', fontSize: '9px', fontFamily: 'inherit', textAlign: 'center', lineHeight: 1.3 }}>Upload</span>
            </>
          )}
        </label>
      </div>
      <p style={{ color: 'var(--tl)', fontSize: '11px', fontFamily: 'inherit' }}>
        First image is the main photo · JPG, PNG, WEBP · Max 5MB each
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Video Uploader ──────────────────────────────────────────────────────── */
function VideoUploader({ videos, onChange }) {
  const [uploading, setUploading] = useState(false);
  const getUrl = (vid) => (typeof vid === 'string' ? vid : vid?.url || '');

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (videos.length + files.length > 2) { toast.error('Max 2 videos'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('videos', f));
      const res = await uploadAPI.uploadVideos(formData);
      onChange([...videos, ...res.videos]);
      toast.success(`${res.videos.length} video(s) uploaded!`);
    } catch {
      toast.error('Failed to upload videos');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeVideo = (index) => onChange(videos.filter((_, i) => i !== index));

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
        {videos.map((vid, i) => (
          <div key={i} style={{
            position: 'relative', width: '120px', height: '90px',
            border: `1px solid ${BORDER}`, borderRadius: '6px',
            overflow: 'hidden', backgroundColor: 'var(--bg-alt)', flexShrink: 0,
          }}>
            <video
              src={getUrl(vid)}
              muted
              loop
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onMouseOver={e => e.target.play()}
              onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.22)', pointerEvents: 'none',
            }}>
              <FiVideo size={18} style={{ color: 'var(--tl)' }} />
            </div>
            <span style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              backgroundColor: 'rgba(0,0,0,0.55)', color: 'white',
              fontSize: '8px', fontWeight: 600, textAlign: 'center',
              padding: '2px', fontFamily: 'inherit',
            }}>VIDEO {i + 1}</span>
            <button type="button" onClick={() => removeVideo(i)}
              style={{
                position: 'absolute', top: '3px', right: '3px',
                width: '18px', height: '18px', borderRadius: '50%',
                backgroundColor: '#ef4444', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', opacity: 0, transition: 'opacity 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '1'}
              onMouseOut={e => e.currentTarget.style.opacity = '0'}
            >
              <FiX size={10} style={{ color: '#fff' }} />
            </button>
          </div>
        ))}
        {videos.length < 2 && (
          <label style={{
            width: '120px', height: '90px', flexShrink: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: `2px dashed ${uploading ? GOLD + '40' : BORDER}`, borderRadius: '6px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            backgroundColor: 'var(--bg-alt)', transition: 'border-color 0.2s',
          }}
            onMouseOver={e => { if (!uploading) e.currentTarget.style.borderColor = GOLD; }}
            onMouseOut={e => { if (!uploading) e.currentTarget.style.borderColor = BORDER; }}
          >
            <input type="file" multiple accept="video/*" style={{ display: 'none' }}
              onChange={handleFileChange} disabled={uploading} />
            {uploading ? (
              <>
                <div style={{
                  width: '20px', height: '20px', border: `2px solid ${GOLD}`,
                  borderTopColor: 'transparent', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite', marginBottom: '4px',
                }} />
                <span style={{ color: GOLD, fontSize: '9px', fontFamily: 'inherit' }}>Uploading</span>
              </>
            ) : (
              <>
                <FiVideo size={18} style={{ color: 'var(--tl)', marginBottom: '4px' }} />
                <span style={{ color: 'var(--tl)', fontSize: '9px', fontFamily: 'inherit', textAlign: 'center', lineHeight: 1.3 }}>Add Video</span>
              </>
            )}
          </label>
        )}
      </div>
      <p style={{ color: 'var(--tl)', fontSize: '11px', fontFamily: 'inherit' }}>
        Hover to preview · MP4, MOV, WEBM · Max 50MB each · Up to 2 videos
      </p>
    </div>
  );
}

/* ── Size Selector ───────────────────────────────────────────────────────── */
function SizeSelector({ value, onChange }) {
  const toggle = (size) => {
    if (value.includes(size)) onChange(value.filter(s => s !== size));
    else onChange([...value, size]);
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {PRESET_SIZES.map(size => {
        const active = value.includes(size);
        return (
          <button key={size} type="button" onClick={() => toggle(size)}
            style={{
              padding: '7px 14px', fontSize: '12px', fontFamily: 'inherit',
              borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
              backgroundColor: active ? GOLD : 'transparent',
              border: active ? `1px solid ${GOLD}` : '1px solid var(--b)',
              color: active ? '#000' : 'var(--tm)',
              fontWeight: active ? 700 : 400,
            }}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}

/* ── Color Selector ──────────────────────────────────────────────────────── */
function ColorSelector({ value, onChange }) {
  const toggle = (colorName) => {
    if (value.includes(colorName)) onChange(value.filter(c => c !== colorName));
    else onChange([...value, colorName]);
  };
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {PRESET_COLORS.map(({ name, hex }) => {
          const active = value.includes(name);
          const isWhite = hex === '#FFFFFF';
          return (
            <button key={name} type="button" onClick={() => toggle(name)}
              title={name}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: hex, cursor: 'pointer',
                border: active
                  ? `3px solid ${GOLD}`
                  : isWhite
                    ? '2px solid var(--b)'
                    : '2px solid transparent',
                outline: active ? `2px solid ${GOLD}40` : 'none',
                outlineOffset: '2px',
                position: 'relative', transition: 'all 0.15s', flexShrink: 0,
              }}
            >
              {active && (
                <FiCheck size={14}
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    color: isWhite ? '#000' : '#fff',
                    filter: isWhite ? 'none' : 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
          {value.map(name => {
            const c = PRESET_COLORS.find(x => x.name === name);
            return (
              <span key={name} style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '3px 10px 3px 6px',
                backgroundColor: 'var(--bg-alt)',
                border: '1px solid var(--b)',
                borderRadius: '20px', fontSize: '12px', color: 'var(--t)', fontFamily: 'inherit',
              }}>
                <span style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  backgroundColor: c?.hex || '#888',
                  border: c?.hex === '#FFFFFF' ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  flexShrink: 0,
                }} />
                {name}
                <button type="button" onClick={() => toggle(name)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tl)', padding: 0, lineHeight: 1, marginLeft: '2px' }}>
                  <FiX size={10} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Badge Toggle ────────────────────────────────────────────────────────── */
function BadgeToggle({ active, onToggle, icon, label, description, activeColor, activeBg }) {
  return (
    <button type="button" onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 14px', width: '100%',
        backgroundColor: active ? activeBg : 'var(--bg-alt)',
        border: `1px solid ${active ? activeColor + '60' : 'var(--b)'}`,
        borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.18s', fontFamily: 'inherit',
      }}
    >
      <div style={{
        width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
        backgroundColor: active ? activeColor + '20' : 'var(--bg)',
        border: `1px solid ${active ? activeColor + '40' : 'var(--b)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ color: active ? activeColor : 'var(--t)', fontSize: '13px', fontWeight: 600, margin: '0 0 2px', transition: 'color 0.18s' }}>{label}</p>
        <p style={{ color: 'var(--tm)', fontSize: '11px', margin: 0 }}>{description}</p>
      </div>
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
        backgroundColor: active ? activeColor : 'transparent',
        border: `2px solid ${active ? activeColor : 'var(--b)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s',
      }}>
        {active && <FiCheck size={10} style={{ color: '#000' }} />}
      </div>
    </button>
  );
}

/* ── SubCategoryDropdown ─────────────────────────────────────────────────── */
function SubCategoryDropdown({ category, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);
  const grouped = getGroupedSubCategories(category);
  const allNames = getSubCategoryNames(category);
  const filtered = search.trim()
    ? allNames.filter(n => n.toLowerCase().includes(search.toLowerCase()))
    : null;
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  useEffect(() => { if (open) setTimeout(() => searchRef.current?.focus(), 60); }, [open]);
  useEffect(() => { onChange(''); setSearch(''); }, [category]);
  const select = name => { onChange(name); setOpen(false); setSearch(''); };
  const noop = allNames.length === 0;
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button type="button" disabled={noop} onClick={() => setOpen(p => !p)}
        style={{
          ...inp, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: noop ? 'not-allowed' : 'pointer',
          borderColor: open ? GOLD : 'var(--b)', marginBottom: 0,
        }}
      >
        <span style={{ color: value ? 'var(--t)' : 'var(--tl)', fontSize: '14px' }}>
          {value || (noop ? 'No subcategories' : 'Select subcategory')}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {value && (
            <span onClick={e => { e.stopPropagation(); onChange(''); }}
              style={{ color: 'var(--tl)', cursor: 'pointer', lineHeight: 1 }}>
              <FiX size={13} />
            </span>
          )}
          <FiChevronDown size={14} style={{
            color: open ? GOLD : 'var(--tl)',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.18s, color 0.15s',
          }} />
        </div>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)', overflow: 'hidden',
        }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search subcategories..."
              style={{
                width: '100%', background: '#0a0a0a',
                border: '1px solid rgba(255,255,255,0.10)', borderRadius: '5px',
                padding: '7px 10px', fontSize: '12px', color: '#fff', outline: 'none', fontFamily: 'inherit',
              }} />
          </div>
          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {filtered && (
              filtered.length === 0
                ? <p style={{ padding: '14px', fontSize: '12px', color: 'var(--tl)', textAlign: 'center' }}>No results</p>
                : filtered.map(name => <DropItem key={name} name={name} active={value === name} onSelect={select} />)
            )}
            {!filtered && Object.entries(grouped).map(([group, names]) => (
              <div key={group}>
                <div style={{
                  padding: '7px 14px 4px', fontSize: '9px', letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: GOLD, fontWeight: 500,
                  background: 'var(--pl)', borderTop: '1px solid var(--b)',
                }}>
                  {group}
                </div>
                {names.map(name => <DropItem key={name} name={name} active={value === name} onSelect={select} />)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
function DropItem({ name, active, onSelect }) {
  return (
    <button type="button" onClick={() => onSelect(name)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '9px 16px', fontSize: '13px',
        color: active ? GOLD : 'var(--t)',
        background: active ? 'var(--pl)' : 'transparent',
        border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        transition: 'background 0.12s, color 0.12s',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-alt)'; e.currentTarget.style.color = 'var(--t)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--t)'; } }}
    >
      <span>{name}</span>
      {active && <FiCheck size={13} style={{ color: GOLD, flexShrink: 0 }} />}
    </button>
  );
}

/* ── NEW: Size Guide Editor ──────────────────────────────────────────────── */
/**
 * Allows seller to set per-size measurements for Chest, Waist, Hips, Length.
 * Only shows rows for sizes that are selected (form.sizes).
 * Provides a "Reset to Defaults" button per row.
 * The resulting sizeGuide object shape: { S: { chest, waist, hips, length }, ... }
 * This is saved with the product and consumed by ProductDetailPage's SizeGuideModal.
 */
function SizeGuideEditor({ selectedSizes, sizeGuide, onChange }) {
  // selectedSizes: string[]  — e.g. ['S','M','L']
  // sizeGuide: object        — e.g. { S: { chest:'34–35"', ... }, ... }
  // onChange: (newGuide) => void

  const [expanded, setExpanded] = useState(true);

  if (!selectedSizes || selectedSizes.length === 0) {
    return (
      <div style={{
        padding: '14px 16px',
        backgroundColor: 'var(--bg-alt)',
        border: `1px dashed ${BORDER}`,
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <p style={{ color: 'var(--tl)', fontSize: '12px', fontFamily: 'inherit', margin: 0 }}>
          Select sizes above to configure the Size Guide
        </p>
      </div>
    );
  }

  const updateField = (size, field, value) => {
    onChange({
      ...sizeGuide,
      [size]: {
        ...(sizeGuide[size] || {}),
        [field]: value,
      },
    });
  };

  const resetToDefault = (size) => {
    const defaults = DEFAULT_SIZE_MEASUREMENTS[size];
    if (!defaults) return;
    onChange({
      ...sizeGuide,
      [size]: { ...defaults },
    });
    toast.success(`Reset ${size} to defaults`);
  };

  const resetAll = () => {
    const fresh = {};
    selectedSizes.forEach(sz => {
      fresh[sz] = DEFAULT_SIZE_MEASUREMENTS[sz]
        ? { ...DEFAULT_SIZE_MEASUREMENTS[sz] }
        : { chest: '', waist: '', hips: '', length: '' };
    });
    onChange(fresh);
    toast.success('All sizes reset to defaults');
  };

  const cellInp = {
    width: '100%', boxSizing: 'border-box',
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--b)',
    borderRadius: '5px',
    padding: '7px 9px',
    color: 'var(--t)',
    fontSize: '12px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.18s',
  };

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setExpanded(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--tm)', fontSize: '12px', fontFamily: 'inherit', padding: 0,
            }}
          >
            <FiChevronDown
              size={14}
              style={{
                transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s',
                color: GOLD,
              }}
            />
            <span style={{ color: 'var(--tm)', fontSize: '12px' }}>
              {selectedSizes.length} size{selectedSizes.length > 1 ? 's' : ''} configured
            </span>
          </button>
        </div>
        <button
          type="button"
          onClick={resetAll}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'none', border: `1px solid var(--b)`,
            borderRadius: '5px', padding: '5px 10px', cursor: 'pointer',
            color: 'var(--tm)', fontSize: '11px', fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--b)'; e.currentTarget.style.color = 'var(--tm)'; }}
        >
          <FiRefreshCw size={11} /> Reset All Defaults
        </button>
      </div>

      {expanded && (
        <div style={{ overflowX: 'auto' }}>
          {/* Column header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 80px',
            gap: '8px',
            marginBottom: '6px',
            padding: '0 4px',
          }}>
            {['SIZE', 'CHEST', 'WAIST', 'HIPS', 'LENGTH', ''].map((h, i) => (
              <span key={i} style={{
                fontSize: '9px', letterSpacing: '0.12em',
                color: i === 0 ? GOLD : 'var(--tl)',
                fontFamily: 'inherit', textTransform: 'uppercase',
                paddingLeft: i === 0 ? '2px' : 0,
              }}>{h}</span>
            ))}
          </div>

          {/* Rows — one per selected size */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {selectedSizes.map(size => {
              const row = sizeGuide[size] || {};
              const hasDefault = Boolean(DEFAULT_SIZE_MEASUREMENTS[size]);
              return (
                <div
                  key={size}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 80px',
                    gap: '8px',
                    alignItems: 'center',
                    padding: '8px 10px',
                    backgroundColor: 'var(--card)',
                    border: `1px solid var(--b)`,
                    borderRadius: '7px',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = SKY}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--b)'}
                >
                  {/* Size badge */}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '44px', height: '28px',
                    backgroundColor: `${GOLD}18`,
                    border: `1px solid ${GOLD}40`,
                    borderRadius: '5px',
                    fontSize: '11px', fontWeight: 700, color: GOLD,
                    fontFamily: 'inherit', letterSpacing: '0.06em',
                  }}>
                    {size}
                  </span>

                  {/* Measurement inputs */}
                  {MEASUREMENT_FIELDS.map(({ key, placeholder }) => (
                    <input
                      key={key}
                      type="text"
                      value={row[key] || ''}
                      placeholder={placeholder}
                      onChange={e => updateField(size, key, e.target.value)}
                      style={cellInp}
                      onFocus={e => e.target.style.borderColor = SKY}
                      onBlur={e => e.target.style.borderColor = 'var(--b)'}
                    />
                  ))}

                  {/* Reset row button */}
                  <button
                    type="button"
                    onClick={() => resetToDefault(size)}
                    disabled={!hasDefault}
                    title={hasDefault ? `Reset ${size} to defaults` : 'No defaults for this size'}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                      padding: '6px 8px', borderRadius: '5px', cursor: hasDefault ? 'pointer' : 'not-allowed',
                      background: 'transparent',
                      border: `1px solid ${hasDefault ? 'var(--b)' : 'var(--b-inner)'}`,
                      color: hasDefault ? 'var(--tm)' : 'var(--tl)',
                      fontSize: '10px', fontFamily: 'inherit',
                      transition: 'all 0.15s', whiteSpace: 'nowrap',
                    }}
                    onMouseOver={e => { if (hasDefault) { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; } }}
                    onMouseOut={e => { if (hasDefault) { e.currentTarget.style.borderColor = 'var(--b)'; e.currentTarget.style.color = 'var(--tm)'; } }}
                  >
                    <FiRefreshCw size={10} /> Reset
                  </button>
                </div>
              );
            })}
          </div>

          {/* Info note */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '7px',
            marginTop: '12px', padding: '9px 12px',
            backgroundColor: `${GOLD}08`,
            border: `1px solid ${GOLD}18`,
            borderRadius: '7px',
          }}>
            <FiInfo size={12} style={{ color: GOLD, flexShrink: 0, marginTop: '1px' }} />
            <p style={{ color: 'var(--tm)', fontSize: '11px', fontFamily: 'inherit', margin: 0, lineHeight: 1.6 }}>
              These measurements will appear in the <strong style={{ color: 'var(--t)' }}>Size Guide</strong> on your product page.
              Customers can tap "Size Guide" to compare before buying. All measurements in inches.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
/* ── END Size Guide Editor ───────────────────────────────────────────────── */

/* ── Main component ──────────────────────────────────────────────────────── */
export default function SellerProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', description: '', price: '', discountPrice: '', category: '', subCategory: '',
    stock: '', images: [], videos: [], sizes: [], colors: [],
    brand: '', tags: '', material: '', careInstructions: '',
    isNewArrival: false, isBestSeller: false, isFeatured: false,
    // ── NEW: sizeGuide stores per-size measurements ──
    sizeGuide: {},
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // ── When sizes change, auto-populate sizeGuide rows for newly added sizes ──
  const handleSizesChange = (newSizes) => {
    setForm(f => {
      const updatedGuide = { ...f.sizeGuide };
      newSizes.forEach(sz => {
        // Only pre-fill if the row doesn't exist yet
        if (!updatedGuide[sz]) {
          updatedGuide[sz] = DEFAULT_SIZE_MEASUREMENTS[sz]
            ? { ...DEFAULT_SIZE_MEASUREMENTS[sz] }
            : { chest: '', waist: '', hips: '', length: '' };
        }
      });
      // Clean up removed sizes
      Object.keys(updatedGuide).forEach(sz => {
        if (!newSizes.includes(sz)) delete updatedGuide[sz];
      });
      return { ...f, sizes: newSizes, sizeGuide: updatedGuide };
    });
  };

  useEffect(() => {
    if (isEdit) {
      productAPI.getById(id)
        .then(res => {
          const p = res.product;
          const loadedSizes = p.sizes || [];
          // Build sizeGuide: prefer saved data, fall back to defaults
          const loadedGuide = { ...(p.sizeGuide || {}) };
          loadedSizes.forEach(sz => {
            if (!loadedGuide[sz]) {
              loadedGuide[sz] = DEFAULT_SIZE_MEASUREMENTS[sz]
                ? { ...DEFAULT_SIZE_MEASUREMENTS[sz] }
                : { chest: '', waist: '', hips: '', length: '' };
            }
          });
          setForm({
            name: p.name || '',
            description: p.description || '',
            price: p.price || '',
            discountPrice: p.discountPrice || '',
            category: p.category || '',
            subCategory: p.subCategory || '',
            stock: p.stock || '',
            images: p.images || [],
            videos: p.videos || [],
            sizes: loadedSizes,
            colors: (p.colors || []).map(c => typeof c === 'string' ? c : c.name),
            brand: p.brand || '',
            tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
            material: p.material || '',
            careInstructions: p.careInstructions || '',
            isNewArrival: p.isNewArrival || false,
            isBestSeller: p.isBestSeller || false,
            isFeatured: p.isFeatured || false,
            sizeGuide: loadedGuide,
          });
        })
        .catch(() => toast.error('Failed to load product'))
        .finally(() => setFetching(false));
    }
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const getUrl = (img) => (typeof img === 'string' ? img : img?.url || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || !form.stock) {
      toast.error('Please fill all required fields'); return;
    }
    if (form.discountPrice && Number(form.discountPrice) >= Number(form.price)) {
      toast.error('Discount price must be less than selling price'); return;
    }
    setLoading(true);
    try {
      const colorsAsObjects = form.colors.map(c => {
        if (typeof c === 'object') return c;
        const found = PRESET_COLORS.find(p => p.name === c);
        return found ? { name: found.name, hex: found.hex } : { name: c, hex: '#888888' };
      });
      const tagsArray = form.tags
        ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        stock: Number(form.stock),
        colors: colorsAsObjects,
        tags: tagsArray,
        seller: user?._id,
        // sizeGuide is passed as-is — object keyed by size
      };
      if (isEdit) {
        await productAPI.update(id, payload);
        toast.success('Product updated!');
      } else {
        await productAPI.create(payload);
        toast.success('Product added!');
      }
      navigate('/seller/dashboard');
    } catch (err) {
      toast.error(err?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  const { commission, fixed, earnings } = calcEarnings(Number(form.price) || 0);
  const firstImageUrl = getUrl(form.images[0]);

  if (fetching) return (
    <div style={{ minHeight: '100vh', backgroundColor: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'inherit' }}>Loading…</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BG }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Product Form Mobile Responsive ── */
        @media (max-width: 900px) {
          .pf-layout { grid-template-columns: 1fr !important; }
          .pf-sidebar { position: static !important; }
        }
        @media (max-width: 600px) {
          .pf-pricing-grid { grid-template-columns: 1fr 1fr !important; }
          .pf-categ-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .pf-brand-tags { grid-template-columns: 1fr !important; gap: 12px !important; }
          .pf-mat-care { grid-template-columns: 1fr !important; gap: 12px !important; }
          .pf-earnings-grid { grid-template-columns: 1fr 1fr !important; }
          .pf-content { padding: 16px !important; }
          .pf-topbar { padding: 0 12px !important; }
          .sg-grid { grid-template-columns: 48px 1fr 1fr !important; }
          .sg-grid-extra { display: none !important; }
        }
        @media (max-width: 400px) {
          .pf-pricing-grid { grid-template-columns: 1fr !important; }
          .pf-earnings-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── Top bar ── */}
      <div className="pf-topbar" style={{
        backgroundColor: 'var(--bg-alt)', borderBottom: `1px solid ${BORDER}`,
        padding: '0 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '52px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: GOLD, fontFamily: 'Cinzel, serif', fontSize: '15px', letterSpacing: '0.2em' }}>VIDESTORE</span>
          <span style={{ color: 'var(--tl)' }}>|</span>
          <span style={{ color: 'var(--tm)', fontSize: '12px', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {isEdit ? 'Edit Product' : 'Add Product'}
          </span>
        </div>
        <Link to="/"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--tm)', fontSize: '12px', fontFamily: 'inherit', textDecoration: 'none', padding: '6px 12px', border: `1px solid ${BORDER}`, borderRadius: '6px' }}
          onMouseOver={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = 'var(--tm)'; }}>
          <FiArrowLeft size={13} /> <span style={{ display: 'inline' }}>Back</span>
        </Link>
      </div>

      <div className="pf-content" style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px 24px' }}>
        <button onClick={() => navigate('/seller/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--tm)', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', marginBottom: '24px' }}>
          <FiArrowLeft size={14} /> Back to Seller Dashboard
        </button>
        <h1 style={{ color: 'var(--t)', fontFamily: 'Cinzel, serif', fontSize: '20px', letterSpacing: '0.1em', marginBottom: '28px' }}>
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="pf-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

            {/* ── LEFT COLUMN ── */}
            <div>
              {/* Basic Information */}
              <div style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: '20px', padding: '24px', marginBottom: '16px', boxShadow: 'var(--shadow)' }}>
                <p style={{ color: GOLD, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 18px', fontFamily: 'inherit' }}>Basic Information</p>

                <label style={lbl}>Product Name *</label>
                <input style={{ ...inp, marginBottom: '16px' }} value={form.name}
                  onChange={e => set('name', e.target.value)} placeholder="e.g. Classic Oversized Tee"
                  onFocus={e => e.target.style.borderColor = SKY}
                  onBlur={e => e.target.style.borderColor = 'var(--b)'} required />

                <label style={lbl}>Description</label>
                <textarea style={{ ...inp, marginBottom: '16px', minHeight: '100px', resize: 'vertical' }}
                  value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Describe your product…"
                  onFocus={e => e.target.style.borderColor = SKY}
                  onBlur={e => e.target.style.borderColor = 'var(--b)'} />

                <div className="pf-brand-tags" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={lbl}>Brand</label>
                    <input style={{ ...inp, marginBottom: 0 }} value={form.brand}
                      onChange={e => set('brand', e.target.value)} placeholder="e.g. VideStore"
                      onFocus={e => e.target.style.borderColor = SKY}
                      onBlur={e => e.target.style.borderColor = 'var(--b)'} />
                  </div>
                  <div>
                    <label style={lbl}>Tags (comma separated)</label>
                    <input style={{ ...inp, marginBottom: 0 }} value={form.tags}
                      onChange={e => set('tags', e.target.value)} placeholder="e.g. cotton, casual, summer"
                      onFocus={e => e.target.style.borderColor = SKY}
                      onBlur={e => e.target.style.borderColor = 'var(--b)'} />
                  </div>
                </div>

                <div className="pf-mat-care" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={lbl}>Material</label>
                    <input style={{ ...inp, marginBottom: 0 }} value={form.material}
                      onChange={e => set('material', e.target.value)} placeholder="e.g. 100% Cotton"
                      onFocus={e => e.target.style.borderColor = SKY}
                      onBlur={e => e.target.style.borderColor = 'var(--b)'} />
                  </div>
                  <div>
                    <label style={lbl}>Care Instructions</label>
                    <input style={{ ...inp, marginBottom: 0 }} value={form.careInstructions}
                      onChange={e => set('careInstructions', e.target.value)} placeholder="e.g. Machine wash cold"
                      onFocus={e => e.target.style.borderColor = SKY}
                      onBlur={e => e.target.style.borderColor = 'var(--b)'} />
                  </div>
                </div>

                <div className="pf-categ-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={lbl}>Category *</label>
                    <select style={{ ...inp, marginBottom: 0, appearance: 'none', cursor: 'pointer' }}
                      value={form.category} onChange={e => set('category', e.target.value)}
                      onFocus={e => e.target.style.borderColor = SKY}
                      onBlur={e => e.target.style.borderColor = 'var(--b)'} required>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c} style={{ backgroundColor: '#0d0d0d' }}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Sub Category</label>
                    <SubCategoryDropdown category={form.category} value={form.subCategory} onChange={val => set('subCategory', val)} />
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: '20px', padding: '24px', marginBottom: '16px' }}>
                <p style={{ color: GOLD, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 18px', fontFamily: 'inherit' }}>Pricing & Stock</p>
                <div className="pf-pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={lbl}>Selling Price (₹) *</label>
                    <input type="number" style={{ ...inp, marginBottom: 0 }} value={form.price}
                      onChange={e => set('price', e.target.value)} placeholder="0"
                      onFocus={e => e.target.style.borderColor = SKY}
                      onBlur={e => e.target.style.borderColor = 'var(--b)'} min="0" required />
                  </div>
                  <div>
                    <label style={lbl}>Discount Price (₹)</label>
                    <input type="number" style={{ ...inp, marginBottom: 0 }} value={form.discountPrice}
                      onChange={e => set('discountPrice', e.target.value)} placeholder="0"
                      onFocus={e => e.target.style.borderColor = SKY}
                      onBlur={e => e.target.style.borderColor = 'var(--b)'} min="0" />
                  </div>
                  <div>
                    <label style={lbl}>Stock Quantity *</label>
                    <input type="number" style={{ ...inp, marginBottom: 0 }} value={form.stock}
                      onChange={e => set('stock', e.target.value)} placeholder="0"
                      onFocus={e => e.target.style.borderColor = SKY}
                      onBlur={e => e.target.style.borderColor = 'var(--b)'} min="0" required />
                  </div>
                </div>
                {form.discountPrice && Number(form.discountPrice) > 0 && Number(form.price) > 0 && Number(form.discountPrice) < Number(form.price) && (
                  <div style={{ marginBottom: '12px', padding: '8px 12px', backgroundColor: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#4ade80', fontSize: '12px', fontFamily: 'inherit' }}>
                      🏷 {Math.round(((Number(form.price) - Number(form.discountPrice)) / Number(form.price)) * 100)}% off — customers see ₹{Number(form.discountPrice).toLocaleString()} instead of ₹{Number(form.price).toLocaleString()}
                    </span>
                  </div>
                )}
                {Number(form.price) > 0 && (
                  <div style={{ backgroundColor: 'var(--bg-alt)', border: `1px solid ${GOLD}25`, borderRadius: '8px', padding: '14px' }}>
                    <p style={{ color: 'var(--tm)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px', fontFamily: 'inherit' }}>Your Earnings Preview</p>
                    <div className="pf-earnings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                      {[
                        { label: 'Selling Price', value: `₹${Number(form.price).toLocaleString()}`, color: 'var(--t)' },
                        { label: '10% Commission', value: `- ₹${commission}`, color: '#f87171' },
                        { label: 'Fixed Fee', value: `- ₹${fixed}`, color: '#fbbf24' },
                        { label: 'You Earn', value: `₹${earnings}`, color: '#4ade80' },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ textAlign: 'center', padding: '8px', backgroundColor: 'var(--bg)', border: '1px solid var(--b)', borderRadius: '6px' }}>
                          <p style={{ color: 'var(--tm)', fontSize: '10px', margin: '0 0 3px', fontFamily: 'inherit' }}>{label}</p>
                          <p style={{ color, fontSize: '14px', fontWeight: 700, margin: 0, fontFamily: 'inherit' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Images */}
              <div style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: '20px', padding: '24px', marginBottom: '16px', boxShadow: 'var(--shadow)' }}>
                <p style={{ color: GOLD, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 18px', fontFamily: 'inherit' }}>Product Images</p>
                <ImageUploader images={form.images} onChange={imgs => set('images', imgs)} />

                <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: '20px', paddingTop: '20px' }}>
                  <p style={{ color: GOLD, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 14px', fontFamily: 'inherit' }}>
                    Product Videos <span style={{ color: 'var(--tl)', fontSize: '9px', letterSpacing: '0.05em', textTransform: 'none', fontWeight: 400 }}>(optional · max 2)</span>
                  </p>
                  <VideoUploader videos={form.videos} onChange={vids => set('videos', vids)} />
                </div>
              </div>

              {/* Sizes & Colors */}
              <div style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: '20px', padding: '24px', marginBottom: '16px' }}>
                <p style={{ color: GOLD, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 20px', fontFamily: 'inherit' }}>Sizes & Colors</p>
                <div style={{ marginBottom: '24px' }}>
                  <label style={lbl}>Available Sizes</label>
                  {/* ── Use handleSizesChange so sizeGuide stays in sync ── */}
                  <SizeSelector value={form.sizes} onChange={handleSizesChange} />
                  {form.sizes.length > 0 && (
                    <p style={{ color: 'var(--tl)', fontSize: '11px', marginTop: '8px', fontFamily: 'inherit' }}>
                      Selected: {form.sizes.join(', ')}
                    </p>
                  )}
                </div>
                <div>
                  <label style={lbl}>Available Colors</label>
                  <ColorSelector value={form.colors} onChange={v => set('colors', v)} />
                </div>
              </div>

              {/* ── NEW: Size Guide Editor card ── */}
              <div style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: '20px', padding: '24px', marginBottom: '16px', boxShadow: 'var(--shadow)' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ color: GOLD, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0, fontFamily: 'inherit' }}>
                      Size Guide
                    </p>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      padding: '2px 8px',
                      backgroundColor: `${GOLD}15`,
                      border: `1px solid ${GOLD}30`,
                      borderRadius: '20px',
                      fontSize: '9px', color: GOLD, fontFamily: 'inherit', letterSpacing: '0.08em',
                    }}>
                      <FiEdit2 size={8} /> Editable
                    </span>
                  </div>
                  {form.sizes.length > 0 && (
                    <span style={{
                      fontSize: '10px', color: 'var(--tm)',
                      fontFamily: 'inherit',
                    }}>
                      Shown to customers on product page
                    </span>
                  )}
                </div>

                <p style={{ color: 'var(--tm)', fontSize: '11px', margin: '0 0 16px', fontFamily: 'inherit', lineHeight: '1.6' }}>
                  Customize measurements for each size. These values appear in the <strong style={{ color: 'var(--tm)' }}>Size Guide</strong> modal when a customer clicks "Size Guide" on your product.
                </p>

                <SizeGuideEditor
                  selectedSizes={form.sizes}
                  sizeGuide={form.sizeGuide}
                  onChange={guide => set('sizeGuide', guide)}
                />
              </div>
              {/* ── END Size Guide Editor card ── */}

              {/* Product Badges */}
              <div style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: '20px', padding: '24px', marginBottom: '16px', boxShadow: 'var(--shadow)' }}>
                <p style={{ color: GOLD, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 14px', fontFamily: 'inherit' }}>Product Badges</p>
                <p style={{ color: 'var(--tm)', fontSize: '11px', margin: '0 0 14px', fontFamily: 'inherit', lineHeight: '1.5' }}>
                  Enable badges to feature this product in special collections.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <BadgeToggle active={form.isFeatured} onToggle={() => set('isFeatured', !form.isFeatured)}
                    icon={<FiAward size={15} style={{ color: form.isFeatured ? '#a78bfa' : 'var(--tl)' }} />}
                    label="Featured Product" description="Highlighted in Featured section & homepage banner"
                    activeColor="#a78bfa" activeBg="rgba(167,139,250,0.06)" />
                  <BadgeToggle active={form.isNewArrival} onToggle={() => set('isNewArrival', !form.isNewArrival)}
                    icon={<FiZap size={15} style={{ color: form.isNewArrival ? '#60a5fa' : 'var(--tl)' }} />}
                    label="New Arrival" description="Shows in New Arrivals section & homepage"
                    activeColor="#60a5fa" activeBg="rgba(96,165,250,0.06)" />
                  <BadgeToggle active={form.isBestSeller} onToggle={() => set('isBestSeller', !form.isBestSeller)}
                    icon={<FiStar size={15} style={{ color: form.isBestSeller ? '#f59e0b' : 'var(--tl)', fill: form.isBestSeller ? '#f59e0b' : 'none' }} />}
                    label="Best Seller" description="Highlighted in Best Sellers & trending pages"
                    activeColor="#f59e0b" activeBg="rgba(245,158,11,0.06)" />
                </div>
                {(form.isFeatured || form.isNewArrival || form.isBestSeller) && (
                  <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {form.isFeatured && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '20px', color: '#a78bfa', fontSize: '11px', fontFamily: 'inherit' }}>
                        <FiAward size={10} /> Featured
                      </span>
                    )}
                    {form.isNewArrival && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '4px 10px', backgroundColor: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '20px', color: '#60a5fa', fontSize: '11px', fontFamily: 'inherit' }}>
                        <FiZap size={10} /> New Arrival
                      </span>
                    )}
                    {form.isBestSeller && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '20px', color: '#f59e0b', fontSize: '11px', fontFamily: 'inherit' }}>
                        <FiStar size={10} /> Best Seller
                      </span>
                    )}
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', fontFamily: 'inherit', alignSelf: 'center' }}>will appear on product card</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN — sticky summary ── */}
            <div className="pf-sidebar">
              <div style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: '20px', padding: '24px', position: 'sticky', top: '20px', boxShadow: 'var(--shadow-lg)' }}>
                <p style={{ color: GOLD, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 16px', fontFamily: 'inherit' }}>Product Summary</p>
                {firstImageUrl ? (
                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <img src={firstImageUrl} alt=""
                      style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', backgroundColor: 'var(--bg-alt)' }}
                      onError={e => e.target.style.display = 'none'} />
                    <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {form.isFeatured && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '3px 8px', backgroundColor: 'rgba(167,139,250,0.9)', borderRadius: '4px', color: '#fff', fontSize: '10px', fontWeight: 700, fontFamily: 'inherit' }}>
                          <FiAward size={9} /> FEATURED
                        </span>
                      )}
                      {form.isNewArrival && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '3px 8px', backgroundColor: 'rgba(96,165,250,0.9)', borderRadius: '4px', color: '#fff', fontSize: '10px', fontWeight: 700, fontFamily: 'inherit' }}>
                          <FiZap size={9} /> NEW
                        </span>
                      )}
                      {form.isBestSeller && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '3px 8px', backgroundColor: 'rgba(245,158,11,0.9)', borderRadius: '4px', color: '#fff', fontSize: '10px', fontWeight: 700, fontFamily: 'inherit' }}>
                          <FiStar size={9} /> BEST SELLER
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '160px', backgroundColor: 'var(--bg-alt)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: `1px dashed ${BORDER}` }}>
                    <FiImage size={28} style={{ color: 'var(--tl)', marginBottom: '8px', opacity: 0.3 }} />
                    <p style={{ color: 'var(--tm)', fontSize: '12px', fontFamily: 'inherit' }}>Upload images above</p>
                  </div>
                )}
                {[
                  { label: 'Name', value: form.name || '—' },
                  { label: 'Brand', value: form.brand || '—' },
                  { label: 'Category', value: form.category || '—' },
                  { label: 'SubCategory', value: form.subCategory || '—' },
                  { label: 'Price', value: form.price ? `₹${Number(form.price).toLocaleString()}` : '—' },
                  { label: 'Discount', value: form.discountPrice ? `₹${Number(form.discountPrice).toLocaleString()}` : '—' },
                  { label: 'Stock', value: form.stock || '—' },
                  { label: 'Sizes', value: form.sizes.length ? form.sizes.join(', ') : '—' },
                  { label: 'Colors', value: form.colors.length ? form.colors.join(', ') : '—' },
                  { label: 'Material', value: form.material || '—' },
                  { label: 'Images', value: form.images.length ? `${form.images.length} uploaded` : '—' },
                  { label: 'Videos', value: form.videos.length ? `${form.videos.length} uploaded` : '—' },
                  {
                    label: 'Size Guide',
                    value: Object.keys(form.sizeGuide).length > 0
                      ? `${Object.keys(form.sizeGuide).length} size${Object.keys(form.sizeGuide).length > 1 ? 's' : ''} set`
                      : '—',
                    highlight: Object.keys(form.sizeGuide).length > 0,
                  },
                  { label: 'Badges', value: [form.isFeatured && 'Featured', form.isNewArrival && 'New Arrival', form.isBestSeller && 'Best Seller'].filter(Boolean).join(', ') || '—' },
                ].map(({ label, value, highlight }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ color: 'var(--tm)', fontSize: '12px', fontFamily: 'inherit' }}>{label}</span>
                    <span style={{
                      color: value === '—' ? 'var(--tl)'
                        : highlight ? GOLD
                          : (label === 'Badges' && value !== '—') ? '#f59e0b'
                            : (label === 'Discount' && value !== '—') ? '#4ade80'
                              : 'var(--t)',
                      fontSize: '12px', fontFamily: 'inherit', maxWidth: '160px',
                      textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{value}</span>
                  </div>
                ))}
                {Number(form.price) > 0 && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: `${GOLD}08`, border: `1px solid ${GOLD}20`, borderRadius: '8px' }}>
                    <p style={{ color: 'var(--tm)', fontSize: '10px', margin: '0 0 4px', fontFamily: 'inherit' }}>You earn per sale</p>
                    <p style={{ color: '#4ade80', fontSize: '20px', fontWeight: 700, margin: 0, fontFamily: 'inherit' }}>₹{earnings.toLocaleString()}</p>
                  </div>
                )}
                <button type="submit" disabled={loading}
                  style={{ width: '100%', marginTop: '16px', padding: '13px', backgroundColor: loading ? `${GOLD}80` : GOLD, border: 'none', borderRadius: '8px', color: '#000', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading ? 'Saving…' : <><FiSave size={15} /> {isEdit ? 'Update Product' : 'Add Product'}</>}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}