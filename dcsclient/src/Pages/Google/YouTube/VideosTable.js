import { useEffect, useState } from 'react';
import RequestResource from '../../../Hooks/RequestResource';


function VideoListAll() {
    const { getResourceList, resourceList, deleteResource } = RequestResource({ endpoint: "youtube", resourceLabel: "YouTube Videos" });

    useEffect(() => {
        getResourceList();
    }, [getResourceList]);

    return (
        <div>
            {resourceList.results.map((video) => (
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
}

export default VideoListAll;
