import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [videos, setVideos] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    // Fetch the list of user's videos from the backend
    async function fetchVideos() {
      const response = await axios.get('/youtube/videos');
      setVideos(response.data);
    }
    fetchVideos();
  }, []);

  // Handler for file input change
  function handleFileChange(event) {
    setFile(event.target.files[0]);
  }

  // Handler for upload button click
  async function handleUploadClick() {
    if (!file) {
      alert('Please choose a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);

    try {
      // Upload the video to the backend
      await axios.post('/youtube/videos', formData);
      alert('Video uploaded successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to upload video');
    }
  }

  return (
    <div>
      <h1>My YouTube Videos</h1>
      <ul>
        {videos.map((video) => (
          <li key={video}>{video}</li>
        ))}
      </ul>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUploadClick}>Upload</button>
    </div>
  );
}

export default App;
