import React, { useEffect, useState } from "react";

const PingStat = () => {
    const [pingLatencyGH, setPingLatencyGH] = useState(null);
    const [pingLatency, setPingLatency] = useState(null);

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

    useEffect(() => {
        const measurePingLatency = async () => {
            const apiEndpoint = 'https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA';

            const startTime = new Date().getTime();
            const response = await fetch(apiEndpoint);
            const endTime = new Date().getTime();

            const latency = endTime - startTime;
            setPingLatency(latency);
        };

        measurePingLatency();
    }, []);

    return (
        <div>
            <div>
                {pingLatencyGH !== null ? (
                    <div>
                        <p>Ping GitHub API latency: {pingLatencyGH.toFixed(2)} ms</p>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
            <div>
                {pingLatency !== null ? (
                    <p>Ping Google API latency: {pingLatency.toFixed(2)} ms</p>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
};

export default PingStat;
