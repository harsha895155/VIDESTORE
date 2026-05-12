import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const PRIMARY = 'var(--p)';
const PRIMARY_LIGHT = 'var(--pl)';
const PRIMARY_DARK = 'var(--pd)';

// ── High-quality fashion images ────────────────────────────────────────────
const SLIDES = [
    {
        img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop&crop=center&auto=format&q=95',
        word1: 'WEAR', word2: 'YOUR', word3: 'STORY',
        sub: 'Autumn · Winter 2026',
    },
    {
        img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=1080&fit=crop&crop=center&auto=format&q=95',
        word1: 'DEFINE', word2: 'YOUR', word3: 'ERA',
        sub: 'Women · New Season',
    },
    {
        img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop&crop=top&auto=format&q=95',
        word1: 'BEYOND', word2: 'THE', word3: 'ORDINARY',
        sub: 'Curated Collection',
    },
    {
        img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&h=1080&fit=crop&crop=top&auto=format&q=95',
        word1: 'DRESS', word2: 'WITH', word3: 'INTENT',
        sub: 'Premium Styles',
    },
];

// ── Grain overlay ──────────────────────────────────────────────────────────
function Grain() {
    return (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.045, pointerEvents: 'none', zIndex: 5 }}>
            <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
            <rect width="100%" height="100%" filter="url(#g)" />
        </svg>
    );
}

// ── Particles ─────────────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    sz: Math.random() * 4 + 1.5,
    delay: Math.random() * 10,
    dur: Math.random() * 12 + 8,
    op: Math.random() * 0.4 + 0.1,
    color: ['var(--p)', 'var(--s)', 'var(--a)'][i % 3],
}));

function Particles() {
    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 4 }}>
            {PARTICLES.map(p => (
                <motion.div
                    key={p.id}
                    style={{
                        position: 'absolute', left: `${p.x}%`, bottom: 0,
                        width: `${p.sz}px`, height: `${p.sz}px`, borderRadius: '50%',
                        background: p.color, opacity: p.op * 0.6,
                        filter: `blur(${p.sz * 0.5}px)`,
                    }}
                    animate={{ y: [0, -900], opacity: [p.op, p.op * 0.4, 0] }}
                    transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear' }}
                />
            ))}
        </div>
    );
}

// ── Cinematic loader ───────────────────────────────────────────────────────
function Loader({ onDone }) {
    const [ph, setPh] = useState(0);
    useEffect(() => {
        const ts = [
            setTimeout(() => setPh(1), 800),
            setTimeout(() => setPh(2), 1800),
            setTimeout(() => setPh(3), 3500),
            setTimeout(() => setPh(4), 5000),
            setTimeout(onDone, 6000),
        ];
        return () => ts.forEach(clearTimeout);
    }, []);

    return (
        <motion.div
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999, background: 'var(--bg)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0,
            }}
        >
            {/* Top cinematic bar */}
            <motion.div
                animate={{ height: ph >= 4 ? '0vh' : '8vh' }}
                transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#040404' }}
            />
            {/* Bottom cinematic bar */}
            <motion.div
                animate={{ height: ph >= 4 ? '0vh' : '8vh' }}
                transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#040404' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', position: 'relative', zIndex: 2 }}>
                {/* Modern Rounded Logo Box */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                    animate={{ 
                        opacity: ph >= 1 ? 1 : 0, 
                        scale: ph >= 1 ? 1 : 0.8,
                        rotate: ph >= 2 ? 0 : -15
                    }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="w-24 h-24 rounded-3xl border-2 border-[var(--p)] flex items-center justify-center relative"
                    style={{ 
                        background: 'rgba(255,255,255,0.02)',
                        boxShadow: `0 0 40px ${PRIMARY}15`
                    }}
                >
                    <span className="serif text-5xl font-black" style={{ color: PRIMARY }}>V</span>
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                        className="absolute -inset-2 rounded-[2rem] border border-dashed opacity-20"
                        style={{ borderColor: PRIMARY }}
                    />
                </motion.div>

                {/* Brand name */}
                <div className="text-center space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: ph >= 2 ? 1 : 0, y: ph >= 2 ? 0 : 10 }}
                        transition={{ duration: 0.8 }}
                        className="serif text-4xl font-bold tracking-[0.2em] uppercase"
                        style={{ color: '#FFFFFF' }}
                    >
                        VIDESTORE
                    </motion.h1>

                    {/* Three Dots Loader */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: ph >= 2 ? 1 : 0 }}
                        className="flex items-center justify-center gap-3 py-2"
                    >
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: PRIMARY }}
                            />
                        ))}
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: ph >= 3 ? 0.4 : 0 }}
                        className="text-[10px] font-black uppercase tracking-[0.6em]"
                        style={{ color: '#FFFFFF' }}
                    >
                        CURATING LUXURY
                    </motion.p>
                </div>
            </div>
        </motion.div>
    );
}

// ── EXPLORE BUTTON ─────────────────────────────────────────────────────────
function ExploreBtn({ onClick }) {
    const [hover, setHover] = useState(false);
    const [fired, setFired] = useState(false);
    const btnRef = useRef(null);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const rx = useTransform(my, [-25, 25], [5, -5]);
    const ry = useTransform(mx, [-80, 80], [-5, 5]);

    const onMove = (e) => {
        const r = btnRef.current?.getBoundingClientRect();
        if (!r) return;
        mx.set(e.clientX - r.left - r.width / 2);
        my.set(e.clientY - r.top - r.height / 2);
    };

    const fire = () => {
        if (fired) return;
        setFired(true);
        setTimeout(onClick, 850);
    };

    return (
        <motion.div
            ref={btnRef}
            style={{ perspective: 700, display: 'inline-block' }}
            onMouseMove={onMove}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => { setHover(false); mx.set(0); my.set(0); }}
        >
            <motion.button
                onClick={fire}
                style={{
                    rotateX: hover ? rx : 0,
                    rotateY: hover ? ry : 0,
                    position: 'relative', padding: 0,
                    background: 'none', border: 'none',
                    cursor: fired ? 'default' : 'pointer',
                    outline: 'none', display: 'block',
                }}
                whileTap={{ scale: 0.97 }}
            >
                {/* Outer glow */}
                <motion.div
                    animate={{ opacity: hover ? 1 : 0, scale: hover ? 1 : 0.6 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        position: 'absolute', inset: '-24px', borderRadius: '8px',
                        background: `radial-gradient(ellipse, ${PRIMARY}35 0%, transparent 65%)`,
                        filter: 'blur(22px)', pointerEvents: 'none', zIndex: 0,
                    }}
                />

                {/* Button face */}
                <motion.div
                    style={{
                        position: 'relative', zIndex: 1,
                        borderRadius: '999px',
                        padding: '20px 48px',
                        display: 'flex', alignItems: 'center', gap: '16px',
                        overflow: 'hidden',
                        background: hover ? 'var(--p)' : 'rgba(13,13,15,0.8)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: `1px solid ${hover ? 'var(--p)' : '#232323'}`,
                        boxShadow: hover ? '0 20px 40px rgba(200, 166, 70, 0.2)' : '0 4px 20px rgba(0,0,0,0.5)',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                >
                    <motion.span
                        animate={{ color: hover ? '#040404' : 'var(--p)' }}
                        style={{
                            fontSize: '12px',
                            fontWeight: 600, letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            fontFamily: 'Inter, sans-serif',
                            whiteSpace: 'nowrap', position: 'relative', zIndex: 1,
                        }}
                    >
                        {fired ? 'Entering Store...' : 'Explore Collection'}
                    </motion.span>
                    <motion.div
                        animate={{ x: hover ? 5 : 0, color: hover ? '#040404' : 'var(--p)' }}
                        style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}
                    >
                        <FiArrowRight size={18} />
                    </motion.div>
                </motion.div>

                {/* Click ripple */}
                <AnimatePresence>
                    {fired && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0.7 }}
                            animate={{ scale: 10, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.85, ease: 'easeOut' }}
                            style={{ position: 'absolute', inset: 0, margin: 'auto', width: '50px', height: '50px', borderRadius: '50%', background: PRIMARY, pointerEvents: 'none', zIndex: 3 }}
                        />
                    )}
                </AnimatePresence>
            </motion.button>
        </motion.div>
    );
}

// ── Vertical progress bar nav ──────────────────────────────────────────────
function SlideDots({ total, cur, onPick }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            {Array.from({ length: total }).map((_, i) => (
                <button key={i} onClick={() => onPick(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px', display: 'flex', alignItems: 'center' }}>
                    <motion.div
                        animate={{
                            height: i === cur ? '36px' : '6px',
                            background: i === cur ? PRIMARY : `${PRIMARY}30`,
                            boxShadow: i === cur ? `0 0 15px var(--p), 0 0 30px var(--p)` : '0 0 0px rgba(0,0,0,0)',
                        }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{ width: '2px', borderRadius: '999px' }}
                    />
                </button>
            ))}
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function LandingPage() {
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);
    const [idx, setIdx] = useState(0);
    const [changing, setChanging] = useState(false);
    const timerRef = useRef(null);

    const goTo = useCallback((next) => {
        if (changing) return;
        setChanging(true);
        setTimeout(() => { setIdx(next); setChanging(false); }, 550);
    }, [changing]);

    useEffect(() => {
        if (!ready) return;
        timerRef.current = setInterval(() => goTo((idx + 1) % SLIDES.length), 6500);
        return () => clearInterval(timerRef.current);
    }, [ready, idx, goTo]);

    const pick = (i) => { clearInterval(timerRef.current); goTo(i); };

    const S = SLIDES[idx];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html,body{overflow:hidden;width:100%;height:100%}
      `}</style>

            <AnimatePresence>
                {!ready && <Loader key="ld" onDone={() => setReady(true)} />}
            </AnimatePresence>

            {ready && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.0 }}
                    style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}
                >
                    {/* ── Background with wipe transition ── */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                        <AnimatePresence>
                            <motion.div
                                key={idx}
                                initial={{ clipPath: 'inset(0 100% 0 0)', scale: 1.07 }}
                                animate={{ clipPath: 'inset(0 0% 0 0)', scale: 1.0 }}
                                exit={{ opacity: 0, zIndex: 0 }}
                                transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
                                style={{ position: 'absolute', inset: 0 }}
                            >
                                <img
                                    src={S.img} alt=""
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* ── Overlays ── */}
                    {/* Bottom fade */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to top, rgba(4,4,4,1) 0%, rgba(4,4,4,0.6) 28%, transparent 58%, rgba(4,4,4,0.3) 100%)' }} />
                    {/* Left fade for text */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(105deg, rgba(4,4,4,0.9) 0%, rgba(4,4,4,0.4) 42%, transparent 72%)' }} />
                    {/* Primary warmth */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', zIndex: 2, background: `linear-gradient(to top, ${PRIMARY}15 0%, transparent 100%)` }} />
                    {/* Vignette */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 2, boxShadow: 'inset 0 0 140px rgba(0,0,0,0.6)' }} />

                    <Grain />
                    <Particles />

                    {/* ── Gold top bar (animated draw) ── */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
                        style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '2px', zIndex: 20,
                            background: `linear-gradient(90deg, transparent 0%, ${PRIMARY_DARK} 12%, ${PRIMARY} 38%, ${PRIMARY_LIGHT} 55%, ${PRIMARY} 78%, transparent 100%)`,
                            transformOrigin: 'left',
                        }}
                    />

                    {/* ── Auto-progress bar at bottom ── */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', zIndex: 20, background: `${PRIMARY}12` }}>
                        <motion.div
                            key={idx}
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 6.5, ease: 'linear' }}
                            style={{ height: '100%', background: `linear-gradient(90deg, ${PRIMARY_DARK}, ${PRIMARY}, ${PRIMARY_LIGHT})` }}
                        />
                    </div>

                    {/* ══ MAIN CONTENT ══ */}
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 10,
                        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                        padding: 'clamp(28px,5vw,72px)',
                        paddingBottom: 'clamp(56px,9vh,88px)',
                    }}>

                        {/* Brand mark — top left */}
                        <motion.div
                            initial={{ opacity: 0, y: -14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.6 }}
                            style={{
                                position: 'absolute',
                                top: 'clamp(22px,3.5vh,44px)',
                                left: 'clamp(28px,5vw,72px)',
                                display: 'flex', alignItems: 'center', gap: '13px',
                            }}
                        >
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: `1px solid ${PRIMARY}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: PRIMARY, fontSize: '15px', fontFamily: "'Cinzel',serif", fontWeight: 700 }}>V</span>
                            </div>
                            <span style={{ color: PRIMARY, fontSize: '10px', letterSpacing: '0.36em', fontFamily: "'Cinzel',serif", textTransform: 'uppercase', fontWeight: 600 }}>
                                VIDESTORE
                            </span>
                        </motion.div>

                        {/* Slide category label */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`sub-${idx}`}
                                initial={{ opacity: 0, x: -24 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 24 }}
                                transition={{ duration: 0.45 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: 'clamp(16px,2.5vh,28px)' }}
                            >
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '36px' }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    style={{ height: '1px', background: `linear-gradient(to right, ${PRIMARY}, transparent)` }}
                                />
                                <span style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: PRIMARY, fontFamily: "'Cinzel',serif", fontWeight: 600 }}>
                                    {S.sub}
                                </span>
                            </motion.div>
                        </AnimatePresence>

                        {/* ── HEADLINE — massive ── */}
                        <div style={{ marginBottom: 'clamp(36px,5vh,56px)' }}>
                            <AnimatePresence mode="wait">
                                <motion.div key={`h-${idx}`}>
                                    {[S.word1, S.word2, S.word3].map((w, wi) => (
                                        <div key={wi} style={{ overflow: 'hidden', lineHeight: 0.90 }}>
                                            <motion.div
                                                initial={{ y: '108%' }}
                                                animate={{ y: '0%' }}
                                                exit={{ y: '-35%', opacity: 0 }}
                                                transition={{ duration: 0.62, delay: wi * 0.065, ease: [0.25, 0.46, 0.45, 0.94] }}
                                            >
                                                <span className="serif" style={{
                                                    display: 'block',
                                                    fontSize: 'clamp(2.4rem,6.8vw,7.2rem)', fontWeight: 400,
                                                    letterSpacing: '-0.03em',
                                                    lineHeight: 0.95,
                                                    paddingBottom: '0.1em',
                                                    ...(wi === 2 ? {
                                                        background: 'linear-gradient(135deg, var(--p), var(--pd))',
                                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                                        fontStyle: 'italic',
                                                    } : {
                                                        color: '#F5F3EE',
                                                        textShadow: '0 10px 40px rgba(0,0,0,0.8)',
                                                    }),
                                                }}>
                                                    {w}
                                                </span>
                                            </motion.div>
                                        </div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* ── EXPLORE BUTTON — hero CTA ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 28 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.85, duration: 0.6 }}
                        >
                            <ExploreBtn onClick={() => navigate('/home')} />
                        </motion.div>

                        {/* Sub-label under button */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.15, duration: 0.6 }}
                            style={{
                                marginTop: '18px',
                                fontSize: 'clamp(11px,1.2vw,13px)',
                                color: 'rgba(255,255,255,0.28)',
                                letterSpacing: '0.07em',
                                fontFamily: "'Cormorant Garamond',Georgia,serif",
                                fontStyle: 'italic',
                            }}
                        >
                            Free shipping above ₹999 &nbsp;·&nbsp; New Collection AW 2026
                        </motion.p>
                    </div>

                    {/* ── Right: vertical dot nav ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0, duration: 0.55 }}
                        style={{
                            position: 'absolute',
                            right: 'clamp(20px,2.5vw,36px)',
                            top: '50%', transform: 'translateY(-50%)',
                            zIndex: 15,
                        }}
                    >
                        <SlideDots total={SLIDES.length} cur={idx} onPick={pick} />
                    </motion.div>

                    {/* ── Bottom right: numeric counter ── */}


                    {/* ── Bottom left: animated swipe hint ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.4 }}
                        style={{
                            position: 'absolute',
                            bottom: 'clamp(26px,3.5vh,42px)',
                            left: 'clamp(28px,5vw,72px)',
                            zIndex: 15,
                            display: 'flex', alignItems: 'center', gap: '11px',
                        }}
                    >
                        <motion.div
                            animate={{ x: [0, 9, 0] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ width: '26px', height: '1px', background: `${PRIMARY}45` }}
                        />
                        <span style={{ fontSize: '8px', letterSpacing: '0.26em', color: `${PRIMARY}45`, textTransform: 'uppercase', fontFamily: "'Cinzel',serif" }}>
                            Explore
                        </span>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
}