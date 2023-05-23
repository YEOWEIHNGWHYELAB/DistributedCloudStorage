import React from "react";
import RequestCloudStat from "../../../Hooks/RequestCloudStat";
import PieChartStat from "./PieChartStat";

const FileStat = () => {
    const {
        statList,
        getFileStat,
        error
    } = RequestCloudStat({
        endpoint: "google/youtube/videos",
        resourceLabel: "Videos",
    });

    const data = [25, 10, 35, 5]; // Example data

    return (
        <div>
            <h2 style={{ textAlign: "left" }}>Files Stat</h2>
            <PieChartStat data={data} />
        </div>
    );
};

export default FileStat;
