import GitHubCalendar from 'react-github-calendar';

export default function GitHubContributions() {
    return (
        <div className="github-contributions-container">
            <h3 className="github-title">GitHub Contributions (2025)</h3>
            <GitHubCalendar
                username="J-Higuera"
                blockSize={14}
                blockMargin={5}
                fontSize={14}
                theme={{
                    light: ['#151515ff', '#00ff11ff'],
                    dark: ['#191919ff', '#00d9ffff']
                }}
            />
        </div>
    );
}
