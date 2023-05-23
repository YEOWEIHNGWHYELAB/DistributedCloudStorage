import React, { useEffect, useState } from "react";
import RequestCloudStat from "../../../Hooks/RequestCloudStat";
import PieChartStat from "./PieChartStat";

const FileStat = () => {
    const {
        numytvideo,
        numytvideoDeleted,
        numghfiles,
        numGHFilesDeleted,
        isLoadingFileData,
        getFileStat,
        error
    } = RequestCloudStat({
        resourceLabel: "File Stat",
    });

    getFileStat();

    return (
        <div>
            <h2 style={{ textAlign: "left" }}>Files Stat</h2>

            <h5>Yellow: {numghfiles} GitHub Files</h5>
            <h5>Green: {numGHFilesDeleted} GitHub Files Deleted</h5>
            <h5>Red: {numytvideo} YouTube Videos</h5>
            <h5>Blue: {numytvideoDeleted} YouTube Videos Deleted</h5>

            {(!isLoadingFileData) ? (
                <div>
                    <PieChartStat data={[numytvideo, numytvideoDeleted, numghfiles, numGHFilesDeleted]} />
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default FileStat;
