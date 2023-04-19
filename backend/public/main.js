// Function to fetch the list of user's videos from the backend
async function fetchVideos() {
    const response = await fetch('/youtube/videos');
    const videos = await response.json();

    const videoList = document.getElementById('video-list');
    videoList.innerHTML = '';
    videos.forEach((video) => {
        const listItem = document.createElement('li');
        listItem.innerText = video;
        videoList.appendChild(listItem);
    });
}

// Handler for upload form submission
async function handleUploadFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    try {
        // Upload the video to the backend
        const response = await fetch('/youtube/videos', {
            method: 'POST',
            body: formData,
        });
        if (response.ok) {
            alert('Video uploaded successfully');
            form.reset();
            fetchVideos();
        } else {
            alert('Failed to upload video');
        }
    } catch (error) {
        console.error(error);
        alert('Failed to upload video');
    }
}

// Fetch the list of user's videos when the page loads
fetchVideos();

// Add a submit event listener to the upload form
const uploadForm = document.getElementById('upload-form');
uploadForm.addEventListener('submit', handleUploadFormSubmit);
