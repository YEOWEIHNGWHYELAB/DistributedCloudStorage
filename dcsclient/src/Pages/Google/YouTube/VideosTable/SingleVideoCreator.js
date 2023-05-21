import React, { useState, useRef } from "react";
import {
    Button as MUIButton,
    MenuItem,
    Select,
    TextField
} from "@mui/material";
import { Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import RequestResourceYTVideo from "../../../../Hooks/RequestResource";

const privacyOptions = [
    { label: 'Public', value: 'public' },
    { label: 'Unlisted', value: 'unlisted' },
    { label: 'Private', value: 'private' },
];

const initialValues = {
    title: '',
    description: '',
    privacy: 'public',
};

const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required').max(100, 'Title must be less than 100 characters'),
    description: Yup.string().required('Description is required').max(5000, 'Description must be less than 5000 characters'),
    privacy: Yup.string().required('Privacy status is required'),
});

function SingleVideoCreator() {
    const {
        addYTVideo
    } = RequestResourceYTVideo({
        endpoint: "google/youtube/videos",
        resourceLabel: "Videos"
    });

    // Video manager
    const [video, setVideo] = useState(null);
    const [isDragOverVideo, setIsDragOverVideo] = useState(false);
    const videoInputRef = useRef(null);
    const handleDropVideo = (event) => {
        event.preventDefault();
        const uploadedFile = event.dataTransfer.files[0];
        setVideo(uploadedFile);
        setIsDragOverVideo(false);
    };
    const handleDragVideoEnter = (event) => {
        event.preventDefault();
        setIsDragOverVideo(true);
    };
    const handleDragVideoLeave = () => {
        setIsDragOverVideo(false);
    };
    const handleVideoChange = (event) => {
        const uploadedFile = event.target.files[0];
        setVideo(uploadedFile);
    };
    const handleCancelUploadVideo = () => {
        setVideo(null);

        if (videoInputRef.current) {
            videoInputRef.current.value = null; // Clear file input value
        }
    };

    // Thumbnail manager
    const [thumbnail, setThumbnail] = useState(null);
    const [isDragOverThumbnail, setIsDragOverThumbnail] = useState(false);
    const thumbnailInputRef = useRef(null);
    const handleDropThumbnail = (event) => {
        event.preventDefault();
        const uploadedFile = event.dataTransfer.files[0];
        setThumbnail(uploadedFile);
        setIsDragOverThumbnail(false);
    };
    const handleDragThumbnailEnter = (event) => {
        event.preventDefault();
        setIsDragOverThumbnail(true);
    };
    const handleDragThumbnailLeave = () => {
        setIsDragOverThumbnail(false);
    };
    const handleThumbnailChange = (event) => {
        const uploadedFile = event.target.files[0];
        setThumbnail(uploadedFile);
    };
    const handleCancelUploadThumbnail = () => {
        setThumbnail(null);

        if (thumbnailInputRef.current) {
            thumbnailInputRef.current.value = null;
        }
    };

    // Global reset
    const handleReset = (resetForm) => {
        handleCancelUploadVideo();
        handleCancelUploadThumbnail();
        resetForm();
    };

    const handleSubmit = (values, { resetForm }) => {
        const formData = new FormData();

        formData.append(`video`, video);
        formData.append(`thumbnail`, thumbnail);
        formData.append(`title`, values.title);
        formData.append(`description`, values.description);
        formData.append(`privacy_status`, values.privacy);

        addYTVideo(formData, () => {
            // Reset the form
            resetForm();
        });
    };

    return (
        <div>
            <input
                style={{
                    display: "none",
                }}
                id="video-upload"
                multiple
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                ref={videoInputRef}
            />

            <input
                style={{
                    display: "none",
                }}
                id="thumbnail-upload"
                multiple
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                ref={thumbnailInputRef}
            />

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, resetForm, errors, touched }) => (
                    <Form>
                        <MUIButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            style={{ margin: "2px" }}
                            disabled={video === null
                                || thumbnail === null
                                || values.title === null || values.title === ""
                                || values.description === null || values.description === ""
                            }
                        >
                            Upload
                        </MUIButton>

                        <label htmlFor="video-upload">
                            <MUIButton
                                component="span"
                                variant="contained"
                                color="primary"
                                style={{ margin: "2px" }}
                            >
                                Choose Video
                            </MUIButton>
                        </label>

                        <label htmlFor="thumbnail-upload">
                            <MUIButton
                                component="span"
                                variant="contained"
                                color="primary"
                                style={{ margin: "2px" }}
                            >
                                Choose Thumbnail
                            </MUIButton>
                        </label>

                        <MUIButton
                            variant="outlined"
                            color="secondary"
                            onClick={handleCancelUploadVideo}
                            disabled={video === null}
                            style={{ margin: "2px" }}
                        >
                            Remove Video
                        </MUIButton>

                        <MUIButton
                            variant="outlined"
                            color="secondary"
                            onClick={handleCancelUploadThumbnail}
                            disabled={thumbnail === null}
                            style={{ margin: "2px" }}
                        >
                            Remove Thumbnail
                        </MUIButton>

                        <MUIButton
                            type="button"
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleReset(resetForm)}
                            style={{ margin: "2px" }}
                        >
                            Reset
                        </MUIButton>

                        <div
                            onDragOver={handleDragVideoEnter}
                            onDragEnter={handleDragVideoEnter}
                            onDragLeave={handleDragVideoLeave}
                            onDrop={handleDropVideo}
                            style={{
                                width: "100%",
                                height: "300px",
                                border: isDragOverVideo ? "2px dashed #888" : "2px dashed #ccc",
                                borderRadius: "5px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                                fontSize: "18px",
                                fontWeight: "bold",
                                color: "#888",
                                margin: "20px 0",
                            }}
                        >
                            {video ? video.name : "Drag and drop your video here"}
                        </div>

                        <div
                            onDragOver={handleDragThumbnailEnter}
                            onDragEnter={handleDragThumbnailEnter}
                            onDragLeave={handleDragThumbnailLeave}
                            onDrop={handleDropThumbnail}
                            style={{
                                width: "100%",
                                height: "300px",
                                border: isDragOverThumbnail ? "2px dashed #888" : "2px dashed #ccc",
                                borderRadius: "5px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                                fontSize: "18px",
                                fontWeight: "bold",
                                color: "#888",
                                margin: "20px 0",
                            }}
                        >
                            {thumbnail ? thumbnail.name : "Drag and drop your thumbnail here"}
                        </div>

                        <Field
                            as={TextField}
                            label="Title"
                            name="title"
                            error={
                                errors.title && touched.title
                            }
                            helperText={
                                touched.title && errors.title
                            }
                            fullWidth
                        />

                        <br />
                        <br />

                        <Field
                            as={TextField}
                            label="Description"
                            name="description"
                            multiline
                            rows={4}
                            fullWidth
                            error={
                                errors.description && touched.description
                            }
                            helperText={
                                touched.description && errors.description
                            }
                        />

                        <br />
                        <br />

                        <Field
                            as={Select}
                            name="privacy"
                            fullWidth
                        >
                            {privacyOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Field>
                    </Form>
                )}
            </Formik>

            <br />
            <br />

            <Link to="/google/ytvideos">
                <MUIButton
                    style={{
                        border: "2px solid grey",
                        margin: "2px",
                        borderRadius: "4px",
                        padding: "8px",
                        width: "15%",
                        boxSizing: "border-box",
                    }}
                >
                    Back
                </MUIButton>
            </Link>
        </div>
    );
}

export default SingleVideoCreator;
