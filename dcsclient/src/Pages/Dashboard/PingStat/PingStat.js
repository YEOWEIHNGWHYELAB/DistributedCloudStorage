import React, { useEffect, useState } from "react";
//import ping from "ping";

const PingStats = () => {
    const [pingLatencyGH, setPingLatencyGH] = useState(null);
    const [pingLatencyYT, setPingLatencyYT] = useState(null);

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

            // let startYT = window.performance.now();
            // try {
            //     // Make a dummy request to the YouTube API
            //     await fetch('https://www.googleapis.com/youtube/v3/');
            // } catch (error) {
            //     console.error('Error:', error);
            //     return;
            // }

            // let endYT = window.performance.now();

            // const latencyYT = endYT - startYT;
            // setPingLatencyYT(latencyYT);
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

export default PingStats;
