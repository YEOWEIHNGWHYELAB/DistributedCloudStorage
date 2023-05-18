import React, { useState } from "react";
//import ping from "ping";

const PingStats = () => {
    const [pingStats, setPingStats] = useState([]);

    const getPingStats = async () => {
        const urls = [
            "https://api.github.com", 
            "https://www.youtube.com"
        ];

        const stats = [];

        for (const url of urls) {
            const res = 1; //await ping.promise.probe(url);
            stats.push({
                url,
                time: res.time,
                alive: res.alive
            });
        }

        setPingStats(stats);
    };

    return (
        <div>
            <button onClick={getPingStats}>Get Ping Stats</button>

            <ul>
                {pingStats.map((stat, index) => (
                    <li key={index}>
                        {stat.url}: {stat.alive ? `${stat.time}ms` : "Down"}
                    </li>
                ))}
            </ul>
            
        </div>
    );
};

export default PingStats;
