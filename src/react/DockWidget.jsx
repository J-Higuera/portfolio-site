// src/react/DockWidget.jsx
import Dock from './Dock.jsx';

const go = (url) => () => window.open(url, '_blank', 'noopener,noreferrer');

export default function DockWidget() {
    const items = [
        {
            icon: <img src="/images/social/linkedin.svg" alt="LinkedIn" width={45} height={45} />,
            label: 'LinkedIn',
            onClick: go('https://www.linkedin.com/in/juan-higuera-104318337/'),
            className: 'brand brand-linkedin',
        },
        {
            icon: <img src="/images/social/github.svg" alt="GitHub" width={45} height={45} />,
            label: 'GitHub',
            onClick: go('https://github.com/J-Higuera'),
            className: 'brand brand-github',
        },
        {
            icon: <img src="/images/social/instagram.svg" alt="Instagram" width={45} height={45} />,
            label: 'Instagram',
            onClick: go('https://www.instagram.com/the_homie_og/'),
            className: 'brand brand-instagram',
        },
        {
            icon: <img src="/images/social/youtube.svg" alt="YouTube" width={45} height={45} />,
            label: 'YouTube',
            onClick: go('https://www.youtube.com/@theaverage10'),
            className: 'brand brand-youtube',
        },
    ];

    return (
        <Dock
            items={items}
            className="social-dock"      // <- only the social dock gets this
            panelHeight={68}
            baseItemSize={50}
            magnification={72}
            distance={150}
            spring={{ mass: 0.3, stiffness: 170, damping: 4 }} // slower + smoother
        />
    );
}
