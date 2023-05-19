import React, { useEffect, useState } from "react";
import RequestCredential from "../../../../Hooks/RequestCredential";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import {
    Button as MUIButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import * as Yup from "yup";

function CredentialsCreator() {
    const [file, setFile] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = (event) => {
        const uploadedFile = event.target.files[0];
        setFile(uploadedFile);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const uploadedFile = event.dataTransfer.files[0];
        setFile(uploadedFile);
        setIsDragOver(false);
    };

    const handleDragEnter = (event) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleUpload = async () => {
        if (file) {
            try {
                // const content = await parseClientSecret(file);
                // Make an API call to your backend to store the content in the database
                // console.log(content);
            } catch (error) {
                console.error("Error parsing client secret:", error);
            }
        }
    };

    return (
        <div>
            <button onClick={handleUpload}>Upload</button>
            <input type="file" onChange={handleFileChange} />
            <div
                onDragOver={handleDragEnter}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    width: "100%",
                    height: "300px",
                    border: isDragOver ? "2px dashed #888" : "2px dashed #ccc",
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
                {file ? file.name : "Drag and drop a file here"}
            </div>
        </div>
    );
}

export default CredentialsCreator;
