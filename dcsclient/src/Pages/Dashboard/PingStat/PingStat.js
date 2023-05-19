import React, { useEffect, useState } from "react";

const PingStat = () => {
    const [pingLatencyGH, setPingLatencyGH] = useState(null);

    useEffect(() => {
        const ping = async () => {
            let startGH = window.performance.now();

            try {
                // Make a dummy request to the GitHub API
                await fetch('https://api.github.com/');
            } catch (error) {
                console.error('Error:', error);
                return;
            }

            let endGH = window.performance.now();

            const latencyGH = endGH - startGH;
            setPingLatencyGH(latencyGH);
        };

        ping();
    }, []);

    return (
        <div>
            {pingLatencyGH !== null ? (
                <div>
                    <p>Ping GitHub latency: {pingLatencyGH.toFixed(2)} milliseconds</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default PingStat;
