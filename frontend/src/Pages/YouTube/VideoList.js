import { useEffect, useState } from 'react';
import axios from 'axios';
import RequestResource from '../../Hooks/RequestResource';

function VideoList() {
    const { getResourceList, resourceList, deleteResource } = RequestResource({ endpoint: "youtube", resourceLabel: "YouTube Videos" });

    useEffect(() => {
        getResourceList();
    }, [getResourceList]);

    return (
        <div>
            {resourceList.results.map((video) => (
                <div key={video.videoId}>
                    <iframe
                        title={video.title}
                        width="560"
                        height="315"
                        src={`https://www.youtube.com/embed/${video.videoId}`}
                        frameborder="0"
                        allowfullscreen="true"
                    ></iframe>
                    <h3>{video.title}</h3>
                </div>
            ))}
        </div>
    );
}

export default VideoList;
