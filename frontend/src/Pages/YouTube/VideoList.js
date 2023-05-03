import { useEffect, useState } from 'react';
import axios from 'axios';

function VideoList() {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await axios.get('http://localhost:3600/youtube', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('JWTToken')}`,
                    },
                });
                setVideos(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchVideos();
    }, []);

    return (
        <div>
            <h1>My Uploaded Videos</h1>
            <ul>
                {videos.map((video) => (
                    <li key={video.id}>{video.title}</li>
                ))}
            </ul>
        </div>
    );
}

export default VideoList;
