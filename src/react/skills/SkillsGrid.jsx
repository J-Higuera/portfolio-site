// src/react/skills/SkillsGrid.jsx
'use client';

import { useRef, useState } from 'react';
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

export default function SkillsGrid() {
    const px = useMotionValue(Infinity);
    const py = useMotionValue(Infinity);

    return (
        <div
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

            {/* Tooltip */}
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
