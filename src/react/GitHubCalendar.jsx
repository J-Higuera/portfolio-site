import React from 'react';
import GitHubCalendar from 'react-github-calendar';

export default function GitHubContributions() {
    return (
        <div className="github-contributions-widget">
            <h3>GitHub Contributions (2025)</h3>
            <GitHubCalendar
                username="J-Higuera"
                blockSize={14}
                blockMargin={5}
                color="#26ff9c"
                fontSize={14}
            />
        </div>
    );
}
