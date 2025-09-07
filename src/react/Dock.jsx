'use client';

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { Children, cloneElement, useEffect, useRef, useState } from 'react';
import './Dock.css';

function DockItem({ children, className = '', onClick, mouseX, spring, distance, magnification, baseItemSize }) {
    const ref = useRef(null);
    const isHovered = useMotionValue(0);

    const mouseDistance = useTransform(mouseX, (val) => {
        const rect = ref.current?.getBoundingClientRect() ?? { left: 0, width: baseItemSize };
        const center = (rect.left ?? rect.x) + (rect.width ?? baseItemSize) / 20;
        return val - center;
    });

    const targetSize = useTransform(
        mouseDistance,
        [-distance, 0, distance],
        [baseItemSize, magnification, baseItemSize]
    );
    const size = useSpring(targetSize, spring);

    // Clear stuck hover/focus when leaving/returning to the tab or window
    useEffect(() => {
        const clear = () => isHovered.set(0);
        const vis = () => { if (document.visibilityState !== 'visible') isHovered.set(0); };
        window.addEventListener('blur', clear);
        window.addEventListener('focus', clear);
        document.addEventListener('visibilitychange', vis);
        return () => {
            window.removeEventListener('blur', clear);
            window.removeEventListener('focus', clear);
            document.removeEventListener('visibilitychange', vis);
        };
    }, [isHovered]);

    const handleClick = (e) => {
        onClick?.(e);
        // immediately drop hover and focus so labels don’t persist
        isHovered.set(0);
        // also park the shared mouse position far away so neighbors shrink
        mouseX.set(Infinity);
        // blur on the next frame so window.open isn't disrupted
        requestAnimationFrame(() => ref.current?.blur());
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e);
        }
    };

    return (
        <motion.div
            ref={ref}
            style={{ width: size, height: size }}
            onHoverStart={() => isHovered.set(1)}
            onHoverEnd={() => isHovered.set(0)}
            onFocus={() => isHovered.set(1)}
            onBlur={() => isHovered.set(0)}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            whileTap={{ scale: 0.94 }}
            className={`dock-item ${className}`}
            tabIndex={0}
            role="button"
            aria-haspopup="true"
        >
            {Children.map(children, (child) => cloneElement(child, { isHovered }))}
        </motion.div>
    );
}

function DockLabel({ children, className = '', ...rest }) {
    const { isHovered } = rest;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const unsub = isHovered.on('change', (v) => setIsVisible(v === 1));
        return () => unsub();
    }, [isHovered]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -10 }}
                    exit={{ opacity: 0, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`dock-label ${className}`}
                    role="tooltip"
                    style={{ x: '-50%' }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function DockIcon({ children, className = '' }) {
    return <div className={`dock-icon ${className}`}>{children}</div>;
}

export default function Dock({
    items,
    className = '',
    spring = { mass: 0.1, stiffness: 150, damping: 12 },
    magnification = 64,
    distance = 96,
    panelHeight = 68,
    baseItemSize = 50,
}) {
    const mouseX = useMotionValue(Infinity);

    return (
        <div className="dock-outer" style={{ height: panelHeight }}>
            <motion.div
                onMouseMove={(e) => mouseX.set(e.clientX)}
                onMouseLeave={() => mouseX.set(Infinity)}
                className={`dock-panel ${className}`}
                style={{ height: panelHeight }}
                role="toolbar"
                aria-label="Application dock"
            >
                {items.map((item, i) => (
                    <DockItem
                        key={i}
                        onClick={item.onClick}
                        className={item.className}
                        mouseX={mouseX}
                        spring={spring}
                        distance={distance}
                        magnification={magnification}
                        baseItemSize={baseItemSize}
                    >
                        <DockIcon>{item.icon}</DockIcon>
                        <DockLabel>{item.label}</DockLabel>
                    </DockItem>
                ))}
            </motion.div>
        </div>
    );
}
