// src/react/skills/SkillsGrid.jsx
'use client';

import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
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

    // pointer in grid-local coords
    const px = useMotionValue(Infinity);
    const py = useMotionValue(Infinity);

    // map icon index -> ref
    const iconRefs = useRef([]);
    if (iconRefs.current.length !== ICONS.length) {
        iconRefs.current = Array(ICONS.length).fill(null).map(() => ({ current: null }));
    }

    // cached icon centers (grid-local)
    const centersRef = useRef([]); // [{cx, cy}]

    const measure = () => {
        const grid = gridRef.current;
        if (!grid) return;
        const g = grid.getBoundingClientRect();
        centersRef.current = iconRefs.current.map(({ current: el }) => {
            if (!el) return { cx: Infinity, cy: Infinity };
            const r = el.getBoundingClientRect();
            return { cx: r.left - g.left + r.width / 2, cy: r.top - g.top + r.height / 2 };
        });
    };

    useLayoutEffect(() => {
        measure();

        const ro = new ResizeObserver(measure);
        const grid = gridRef.current;
        if (grid) ro.observe(grid);

        const onScroll = () => measure();
        window.addEventListener('scroll', onScroll, { passive: true });

        const idle = 'requestIdleCallback' in window
            ? window.requestIdleCallback(measure)
            : setTimeout(measure, 50);

        return () => {
            ro.disconnect();
            window.removeEventListener('scroll', onScroll);
            'cancelIdleCallback' in window ? window.cancelIdleCallback(idle) : clearTimeout(idle);
        };
    }, []);

    // in-view reveal
    useEffect(() => {
        const gridEl = gridRef.current;
        if (!gridEl) return;

        const section = gridEl.closest('.skills1') || gridEl; // fallback to grid
        const items = () => Array.from(gridEl.querySelectorAll('.sg-item'));

        const enter = () => {
            section.classList.add('animate');
            items().forEach((el, i) => {
                el.style.transitionDelay = `${i * 40}ms`;
                el.classList.add('show');
            });
        };
        const leave = () => {
            section.classList.remove('animate');
            items().forEach((el) => {
                el.style.transitionDelay = '';
                el.classList.remove('show');
            });
        };

        const io = new IntersectionObserver(
            ([entry]) => (entry.isIntersecting ? enter() : leave()),
            { threshold: 0.3 }
        );

        io.observe(gridEl);
        return () => {
            io.disconnect();
            leave();
        };
    }, []);

    // reset hotspot on tab/window changes
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

    const onPointerMove = (e) => {
        const grid = gridRef.current;
        if (!grid) return;
        const g = grid.getBoundingClientRect();
        px.set(e.clientX - g.left);
        py.set(e.clientY - g.top);
    };
    const onPointerLeave = () => {
        px.set(Infinity);
        py.set(Infinity);
    };

    return (
        <div
            ref={gridRef}
            className="sg-grid"
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            aria-label="Technologies"
            role="group"
        >
            {ICONS.map(({ src, alt, label }, i) => (
                <Icon
                    key={i}
                    refObj={iconRefs.current[i]}
                    src={src}
                    alt={alt}
                    label={label}
                    px={px}
                    py={py}
                    centersRef={centersRef}
                    index={i}
                />
            ))}
        </div>
    );
}

function Icon({ refObj, src, alt, label, px, py, centersRef, index }) {
    const [hover, setHover] = useState(false);
    const scaleSpring = useSpring(1, SPRING);

    // subscribe to pointer changes; no layout reads here
    useEffect(() => {
        const updateFromX = (x) => {
            const c = centersRef.current[index];
            if (!c) return;
            const dx = x - c.cx;
            const dy = py.get() - c.cy;
            const d = Math.hypot(dx, dy);
            const t = Math.max(0, 1 - d / EFFECT_RADIUS);
            scaleSpring.set(1 + t * (MAX_SCALE - 1));
        };
        const updateFromY = (y) => {
            const c = centersRef.current[index];
            if (!c) return;
            const dx = px.get() - c.cx;
            const dy = y - c.cy;
            const d = Math.hypot(dx, dy);
            const t = Math.max(0, 1 - d / EFFECT_RADIUS);
            scaleSpring.set(1 + t * (MAX_SCALE - 1));
        };
        const unsubX = px.on('change', updateFromX);
        const unsubY = py.on('change', updateFromY);
        return () => { unsubX(); unsubY(); };
    }, [px, py, centersRef, index, scaleSpring]);

    // tap-to-show tooltip (mobile)
    useEffect(() => {
        const el = refObj.current;
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
    }, [refObj]);

    return (
        <motion.div
            className="sg-item"
            ref={refObj}
            style={{ scale: scaleSpring, willChange: 'transform' }}
            onHoverStart={() => setHover(true)}
            onHoverEnd={() => setHover(false)}
            onFocus={() => setHover(true)}
            onBlur={() => setHover(false)}
            tabIndex={0}
            aria-label={label}
        >
            {/* explicit size prevents layout shift while SVG/IMG decodes */}
            <img src={src} alt={alt} width="64" height="64" loading="lazy" decoding="async" />
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
