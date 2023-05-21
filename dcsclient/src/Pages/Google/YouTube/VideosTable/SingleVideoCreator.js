import React, { useState, useRef } from "react";
import { Formik, Form, Field } from "formik";
import { useDrop } from 'react-dnd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    Button as MUIButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Select,
    TextField
} from "@mui/material";
import { Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from "yup";

import RequestResource from "../../../../Hooks/RequestResource";

const privacyOptions = [
    { label: 'Public', value: 'public' },
    { label: 'Unlisted', value: 'unlisted' },
    { label: 'Private', value: 'private' },
];


function SingleVideoCreator() {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [privacy, setPrivacy] = useState('public');

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    };

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };

    const handlePrivacyChange = (event) => {
        setPrivacy(event.target.value);
    };

    const handleSubmit = () => {
        // Handle form submission logic here, e.g., call an API to upload the video
        console.log('Submitted:', title, description, privacy);
    };

    return (
        <div>
            <MUIButton variant="contained" color="primary" onClick={handleSubmit}>
                Upload
            </MUIButton>

            <br/>
            <br/>

            <TextField
                label="Title"
                value={title}
                onChange={handleTitleChange}
                fullWidth
            />

            <br/>
            <br/>

            <TextField
                label="Description"
                value={description}
                onChange={handleDescriptionChange}
                multiline
                rows={4}
                fullWidth
            />

            <br/>
            <br/>

            <Select
                label="Privacy"
                value={privacy}
                onChange={handlePrivacyChange}
                fullWidth
            >
                {privacyOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>

            <br/>
            <br/>

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
