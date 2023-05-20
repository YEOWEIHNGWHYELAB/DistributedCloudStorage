export function performSingleDownload(downloadFiles, enqueueSnackbar) {
    return (id) => {
        downloadFiles({ id: [id] }, (data) => {
            const { download_url, filename } = data;

            fetch(download_url)
                .then((response) => response.blob())
                .then((blob) => {
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = blobUrl;
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(blobUrl);
                })
                .catch((error) => {
                    // console.error("Error downloading file:", error);
                    enqueueSnackbar(`Error downloading file!`);
                });
        });
    };
}

export function performMultipleDownload(downloadFiles, selectedElements, enqueueSnackbar) {
    return () => {
        downloadFiles({ id: selectedElements }, (data) => {
            if (data.download_url.length !== data.filename.length) {
                enqueueSnackbar(`Error downloading files!`);
                return;
            }

            const downloadPromises = data.download_url.map(
                async (url, index) => {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = blobUrl;
                    a.download = data.filename[index];
                    a.click();
                    URL.revokeObjectURL(blobUrl);
                }
            );

            Promise.all(downloadPromises)
                .then(() => {
                    enqueueSnackbar(`Download success!`);
                })
                .catch((error) => {
                    enqueueSnackbar(`Download failed!`);
                });
        });
    };
}

export function fileUploader(selectedFiles, addFile, setSelectedFiles, addMulFiles) {
    return () => {
        if (selectedFiles.length > 0) {
            const formData = new FormData();

            if (selectedFiles.length === 1) {
                formData.append(`File`, selectedFiles[0]);

                addFile(formData, () => {
                    // Reset selected files state after upload
                    setSelectedFiles([]);

                    window.location.reload();
                });
            } else {
                selectedFiles.forEach((file, index) => {
                    formData.append(`File`, file);
                });

                // Perform API call to post formData to the backend
                addMulFiles(formData, () => {
                    setSelectedFiles([]);

                    window.location.reload();
                });
            }
        }
    };
}

export function fileNoSingleUploader(selectedFiles, addFile, setSelectedFiles, addMulFiles) {
    return () => {
        if (selectedFiles.length > 0) {
            const formData = new FormData();

            selectedFiles.forEach((file, index) => {
                formData.append(`File`, file);
            });

            // Perform API call to post formData to the backend
            addMulFiles(formData, () => {
                setSelectedFiles([]);

                window.location.reload();
            });
        }
    };
}
