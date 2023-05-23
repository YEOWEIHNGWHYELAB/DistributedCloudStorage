import React, { useEffect, useState, useRef } from "react";

const PingStat = () => {
    const [pingLatencyGH, setPingLatencyGH] = useState(null);
    const [pingLatency, setPingLatency] = useState(null);

    const googleEndPoint = 'https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA';
    const ghEndPoint = "https://api.github.com/";

    useEffect(() => {
        const ping = async () => {
            let startGH = window.performance.now();

            try {
                // Make a dummy request to the GitHub API
                await fetch(ghEndPoint);
            } catch (error) {
                // console.error('Error:', error);
                return;
            }

            let endGH = window.performance.now();

            const latencyGH = endGH - startGH;
            setPingLatencyGH(latencyGH);
        };

        const interval = setInterval(ping, 1000); // Measure every second

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const measurePingLatency = async () => {
            let startGoogle = window.performance.now();

            try {
                await fetch(googleEndPoint);
            } catch (error) {
                return;
            }

            let endGoogle = window.performance.now();

            const latency = endGoogle - startGoogle;
            setPingLatency(latency);
        };

        const interval = setInterval(measurePingLatency, 1000); // Measure every second

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <div>
                {pingLatencyGH !== null ? (
                    <div>
                        <p>Ping GitHub latency: {pingLatencyGH.toFixed(1)} ms</p>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
            <div>
                {pingLatency !== null ? (
                    <div>
                        <p>Ping Google latency: {pingLatency.toFixed(1)} ms</p>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
};

export default PingStat;
