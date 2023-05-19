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

    const handleFileChange = (event) => {
        const uploadedFile = event.target.files[0];
        setFile(uploadedFile);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const uploadedFile = event.dataTransfer.files[0];
        setFile(uploadedFile);
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                style={{
                    width: "300px",
                    height: "200px",
                    border: "1px solid black",
                }}
            >
                {file ? file.name : "Drag and drop a file here"}
            </div>
            {/* Add a button to trigger the upload */}
        </div>
    );
}

export default CredentialsCreator;
