import React, { useEffect, useState } from "react";
import ReactApexChart from 'react-apexcharts';

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

        const interval = setInterval(ping, 1000); // Measure every second

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const measurePingLatency = async () => {
            const apiEndpoint = 'https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA';

            let startGoogle = window.performance.now();

            const response = await fetch(apiEndpoint);

            let endGoogle = window.performance.now();

            const latency = endGoogle - startGoogle;
            setPingLatency(latency);
        };

        const interval = setInterval(measurePingLatency, 1000); // Measure every second

        return () => clearInterval(interval);
    }, []);

    const [options, setOptions] = useState({
        chart: {
            id: 'basic-bar'
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        }
    });

    const [series, setSeries] = useState([
        {
            name: 'Sales',
            data: [30, 40, 45, 50, 49, 60, 70, 91, 76, 85, 90, 82]
        }
    ]);

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
                    <p>Ping Google latency: {pingLatency.toFixed(1)} ms</p>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
            <div>
                <ReactApexChart options={options} series={series} type="bar" height={350} />
            </div>
        </div>
    );
};

export default PingStat;
