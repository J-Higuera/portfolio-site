import Dock from './Dock.jsx';

// If your SVGs live in /public/images/social, Vite serves them at /images/social/...
const go = (url) => () => window.open(url, '_blank', 'noopener,noreferrer');

export default function DockWidget() {
    const items = [
        {
            icon: <img src="/images/social/linkedin.svg" alt="LinkedIn" width={45} height={45} />,
            label: 'LinkedIn',
            onClick: go('https://www.linkedin.com/in/juan-higuera-104318337/'),
        },
        {
            icon: <img src="/images/social/github.svg" alt="GitHub" width={45} height={45} />,
            label: 'GitHub',
            onClick: go('https://github.com/J-Higuera'),
        },
        {
            icon: <img src="/images/social/instagram.svg" alt="Instagram" width={45} height={45} />,
            label: 'Instagram',
            onClick: go('https://www.instagram.com/the_homie_og/'),
        },
        {
            icon: <img src="/images/social/youtube.svg" alt="YouTube" width={45} height={45} />,
            label: 'YouTube',
            onClick: go('https://www.youtube.com/@theaverage10'),
        },
    ];

    return (
        <Dock
            items={items}
            panelHeight={70}
            baseItemSize={50}
            magnification={80}
            distance={80}
            spring={{ mass: 0.2, stiffness: 84, damping: 8 }} // slower + smoother
        />
    );
}

