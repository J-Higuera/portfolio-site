// src/react/skills/SkillsGrid.jsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import './SkillsGrid.css';

const ICONS = [
    { src: '/images/icons/html5.svg', alt: 'HTML5', label: 'HTML5' },
    { src: '/images/icons/css3.svg', alt: 'CSS3', label: 'CSS3' },
    { src: '/images/icons/javascript.svg', alt: 'JavaScript', label: 'JavaScript' },
    { src: '/images/icons/docker.svg', alt: 'Docker', label: 'Docker' },
    { src: '/images/icons/git.svg', alt: 'Git', label: 'Git' },
    { src: '/images/icons/python.svg', alt: 'Python', label: 'Python' },
    { src: '/images/icons/nodejs.svg', alt: 'Node.js', label: 'Node.js' },
    { src: '/images/icons/mysql.svg', alt: 'MySQL', label: 'MySQL' },
    { src: '/images/icons/c++.svg', alt: 'C++', label: 'C++' },
    { src: '/images/icons/visual-studio-code.svg', alt: 'VS Code', label: 'VS Code' },
    { src: '/images/icons/github.svg', alt: 'GitHub', label: 'GitHub' },
    { src: '/images/icons/Vite.js.svg', alt: 'Vite', label: 'Vite' },
];

const SPRING = { mass: 0.12, stiffness: 180, damping: 16 };
const EFFECT_RADIUS = 50;
const MAX_SCALE = 1.5;
const TAP_SHOW_MS = 900;

export default function SkillsGrid() {
    const gridRef = useRef(null);

    // shared pointer position (Infinity = offscreen)
    const px = useMotionValue(Infinity);
    const py = useMotionValue(Infinity);

    // IN-VIEW REVEAL (replaces your old index.js observer)
    useEffect(() => {
        const gridEl = gridRef.current;
        if (!gridEl) return;

        // your section wrapper: .skills1.mobile-only
        const section = gridEl.closest('.skills1');
        const items = () => Array.from(gridEl.querySelectorAll('.sg-item'));

        const enter = () => {
            section?.classList.add('animate'); // background glow
            items().forEach((el, i) => {
                el.style.transitionDelay = `${i * 40}ms`; // stagger like before
                el.classList.add('show');
            });
        };
        const leave = () => {
            section?.classList.remove('animate');
            items().forEach((el) => {
                el.style.transitionDelay = '';
                el.classList.remove('show');
            });
        };

        const io = new IntersectionObserver(([entry]) => {
            entry.isIntersecting ? enter() : leave();
        }, { threshold: 0.3 });

        io.observe(gridEl);

        return () => {
            io.disconnect();
            leave(); // clean up classes if unmounted
        };
    }, []);

    // reset “hot spot” so tooltips don’t stick when tab/window changes
    useEffect(() => {
        const reset = () => { px.set(Infinity); py.set(Infinity); };
        const onVis = () => { if (document.visibilityState !== 'visible') reset(); };
        window.addEventListener('blur', reset);
        window.addEventListener('focus', reset);
        document.addEventListener('visibilitychange', onVis);
        return () => {
            window.removeEventListener('blur', reset);
            window.removeEventListener('focus', reset);
            document.removeEventListener('visibilitychange', onVis);
        };
    }, [px, py]);

    return (
        <div
            ref={gridRef}
            className="sg-grid"
            onPointerMove={(e) => { px.set(e.clientX); py.set(e.clientY); }}
            onPointerLeave={() => { px.set(Infinity); py.set(Infinity); }}
            aria-label="Technologies"
            role="group"
        >
            {ICONS.map(({ src, alt, label }, i) => (
                <Icon key={i} src={src} alt={alt} label={label} px={px} py={py} />
            ))}
        </div>
    );
}

function Icon({ src, alt, label, px, py }) {
    const ref = useRef(null);
    const [hover, setHover] = useState(false);

    const scale = useSpring(
        useTransform([px, py], ([x, y]) => {
            const el = ref.current;
            if (!el || !isFinite(x) || !isFinite(y)) return 1;
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const d = Math.hypot(x - cx, y - cy);
            const t = Math.max(0, 1 - d / EFFECT_RADIUS);
            return 1 + t * (MAX_SCALE - 1);
        }),
        SPRING
    );

    // mobile-friendly: click/tap shows tooltip briefly
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let t;
        const onClick = (e) => {
            e.preventDefault();
            setHover(true);
            clearTimeout(t);
            t = setTimeout(() => setHover(false), TAP_SHOW_MS);
        };
        el.addEventListener('click', onClick);
        return () => { el.removeEventListener('click', onClick); clearTimeout(t); };
    }, []);

    return (
        <motion.div
            className="sg-item"
            ref={ref}
            style={{ scale }}
            onHoverStart={() => setHover(true)}
            onHoverEnd={() => setHover(false)}
            onFocus={() => setHover(true)}
            onBlur={() => setHover(false)}
            tabIndex={0}
            aria-label={label}
        >
            <img src={src} alt={alt} loading="lazy" decoding="async" />

            <AnimatePresence>
                {hover && (
                    <motion.div
                        className="sg-tip"
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: -10 }}
                        exit={{ opacity: 0, y: 0 }}
                        transition={{ duration: 0.18 }}
                        role="tooltip"
                    >
                        {label}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
