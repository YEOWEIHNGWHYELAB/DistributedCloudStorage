import React, { useEffect, useState } from "react";
import RequestResourceYouTube from '../../Hooks/RequestYouTubeResource';

const VideoListPaginated = () => {
    const [videoStack, setVideoStack] = useState([""]);
    const [pageToken, setPageToken] = useState(videoStack[0]);

    const { getVideoListByPageToken, youtubeResourceList } = RequestResourceYouTube({ endpoint: "youtube2", resourceLabel: "YouTube Videos" });

    useEffect(() => {
        getVideoListByPageToken();
    }, [getVideoListByPageToken]);

    const handlePreviousPage = () => {
        console.log(videoStack);

        setVideoStack((prevStack) => {
            const newStack = [...prevStack];
            newStack.pop();
            return newStack;
        });

        setPageToken(videoStack[videoStack.length - 2] || "");
    };

    const handleNextPage = () => {
        setVideoStack((prevStack) => [...prevStack, pageToken]);
        setPageToken(youtubeResourceList.video.length > 0 ? youtubeResourceList.pageToken : "");
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                <button disabled={pageToken === ""} onClick={handlePreviousPage}>
                    Previous
                </button>

                <button onClick={handleNextPage}>
                    Next
                </button>
            </div>

            {youtubeResourceList.video.map((video) => (
                <div key={video.videoId} style={{ border: "1px solid", margin: "10px", padding: "10px" }}>
                    <iframe
                        title={video.title}
                        width="300"
                        height="200"
                        src={`https://www.youtube.com/embed/${video.videoId}`}
                        allowFullScreen="true"
                    ></iframe>
                    <h3>{video.title}</h3>
                </div>
            ))}
        </div>
    );
};

export default VideoListPaginated;
