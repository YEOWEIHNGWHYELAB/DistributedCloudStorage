import React, { useEffect, useState } from "react";
import { Button as MUIButton } from "@mui/material";
import parseClientSecret from "./ParseClientSecret";

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
                const parsedData = await parseClientSecret(file);
                console.log(parsedData);
            } catch (error) {
                alert("File is Invalid!");
            }
        }
    };

    const handleCancelUpload = () => setFile(null);

    return (
        <div>
            <input
                style={{
                    display: "none",
                }}
                id="file-upload"
                multiple
                type="file"
                onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
                <MUIButton
                    variant="contained"
                    component="span"
                    style={{
                        border: "2px solid #0000ff",
                        margin: "2px",
                        borderRadius: "4px",
                        padding: "8px",
                        width: "25%",
                        boxSizing: "border-box",
                        color: "green",
                        background: "transparent"
                    }}
                >
                    CHOOSE CLIENT SECRET
                </MUIButton>
            </label>

            <MUIButton
                style={{
                    border: "2px solid grey",
                    margin: "2px",
                    borderRadius: "4px",
                    padding: "8px",
                    width: "25%",
                    boxSizing: "border-box",
                }}
                onClick={handleUpload}
            >
                UPLOAD CLIENT SECRET
            </MUIButton>

            <MUIButton
                style={{
                    border: "2px solid grey",
                    margin: "2px",
                    borderRadius: "4px",
                    padding: "8px",
                    width: "15%",
                    boxSizing: "border-box",
                }}
                onClick={handleCancelUpload}
            >
                CANCEL
            </MUIButton>
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
