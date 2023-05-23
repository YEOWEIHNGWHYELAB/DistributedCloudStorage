import React, { useEffect, useState, useRef } from "react";
import axios from 'axios';

const PingStat = () => {
    const [pingLatencyGH, setPingLatencyGH] = useState(null);
    const [pingLatency, setPingLatency] = useState(null);
    const [pingLatencyDCS, setPingLatencyDCS] = useState(null);

    const dcsServerRouteAuth = 'http://localhost:3600/cloudstat/pinglatencyauth';
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

            const latencyGoogle = endGoogle - startGoogle;
            setPingLatency(latencyGoogle);
        };

        const interval = setInterval(measurePingLatency, 1000); // Measure every second

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const measurePingLatency = async () => {
            let startDCSAuth = window.performance.now();

            try {
                axios.get(dcsServerRouteAuth)
                    .then()
                    .catch(error => {
                        return;
                    });
            } catch (error) {
                return;
            }

            let endDCSAuth = window.performance.now();

            const latencyDCSAuth = endDCSAuth - startDCSAuth;
            setPingLatencyDCS(latencyDCSAuth);
        };

        const interval = setInterval(measurePingLatency, 1000); // Measure every second

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h2 style={{ textAlign: "left" }}>Ping Latency</h2>

            <div>
                {pingLatencyDCS !== null ? (
                    <div>
                        <p>Ping SMCOverlord latency: {pingLatencyDCS.toFixed(1)} ms</p>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
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
