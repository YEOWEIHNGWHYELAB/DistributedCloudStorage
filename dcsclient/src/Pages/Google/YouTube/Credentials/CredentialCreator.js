import React, { useState, useRef } from "react";
import { Formik, Form, Field } from "formik";
import {
    Button as MUIButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from "@mui/material";
import parseClientSecret from "./ParseClientSecret";
import { Link } from 'react-router-dom';
import * as Yup from "yup";

import RequestCredential from "../../../../Hooks/RequestCredential";

function CredentialsCreator() {
    const {
        getOAuthLinkYT,
        addResource
    } = RequestCredential({
        endpoint: "google/credentialsyt",
        resourceLabel: "YouTube Credentials",
    });

    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const [oAuth, setOAuth] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    const handleFileChange = (event) => {
        const uploadedFile = event.target.files[0];
        setFile(uploadedFile);
    };

    const handleCancelUpload = () => {
        setFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = null; // Clear file input value
        }
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

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSubmit = (values) => {
        let newOAuth = oAuth;
        newOAuth["email"] = values.email;

        addResource(newOAuth, () => {
            window.location.href = "/google/credentialyt";
        });

        handleCloseDialog();
    };

    const handleGetOAuthCode = async () => {
        if (file) {
            try {
                const parsedData = await parseClientSecret(file);
                localStorage.setItem('YTClientSecret', JSON.stringify(parsedData));

                getOAuthLinkYT(parsedData, (linkToAuthenticate) => {
                    window.location.href = linkToAuthenticate;
                });
            } catch (error) {
                alert("File is Invalid!");
            }
        } else {
            alert("No file selected!");
        }
    };

    const handleUploadOAuth = async () => {
        if (localStorage.getItem('YTClientSecret') != null) {
            const oAuthData = localStorage.getItem('YTClientSecret');
            let oAuthenticator = JSON.parse(oAuthData);
            localStorage.removeItem('YTClientSecret');

            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');

            if (code) {
                // If the 'code' value contains special characters, you can 
                // convert it to a proper string using the decodeURIComponent() 
                // function
                const decodedCode = decodeURIComponent(code);
                oAuthenticator["yt_access_token_kickstart"] = decodedCode;
                setOAuth(oAuthenticator);
                setOpenDialog(true);
            } else {
                alert("Invalid code!");
            }
        } else {
            alert("OAuth is invalid!");
        }
    };

    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required")
    });

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
                ref={fileInputRef}
            />

            <MUIButton
                style={{
                    border: "2px solid grey",
                    margin: "2px",
                    borderRadius: "4px",
                    padding: "8px",
                    width: "25%",
                    boxSizing: "border-box",
                }}
                onClick={handleUploadOAuth}
                disabled={localStorage.getItem('YTClientSecret') === null}
            >
                SUBMIT OAUTH
            </MUIButton>

            <MUIButton
                style={{
                    border: "2px solid grey",
                    margin: "2px",
                    borderRadius: "4px",
                    padding: "8px",
                    width: "25%",
                    boxSizing: "border-box",
                }}
                onClick={handleGetOAuthCode}
                disabled={file === null}
            >
                UPLOAD CLIENT SECRET
            </MUIButton>

            <label htmlFor="file-upload">
                <MUIButton
                    component="span"
                    style={{
                        border: "2px solid grey",
                        margin: "2px",
                        borderRadius: "4px",
                        padding: "8px",
                        width: "25%",
                        boxSizing: "border-box",
                        color: "green",
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
                    width: "15%",
                    boxSizing: "border-box"
                }}
                onClick={handleCancelUpload}
                disabled={file === null}
            >
                CANCEL
            </MUIButton>

            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
                <DialogTitle>
                    Enter the email address
                </DialogTitle>

                <Formik
                    initialValues={{
                        email: ""
                    }}
                    onSubmit={(values) => {
                        handleSubmit(values);
                    }}
                    validationSchema={validationSchema}
                >
                    {({ values, errors, touched, handleChange }) => (
                        <Form>
                            <DialogContent>
                                <Field
                                    name="email"
                                    as={TextField}
                                    label="Email"
                                    fullWidth
                                    margin="normal"
                                    value={values.email}
                                    error={errors.email && touched.email}
                                    helperText={touched.email && errors.email}
                                    onChange={handleChange}
                                />
                            </DialogContent>
                            <DialogActions>
                                <MUIButton
                                    onClick={handleCloseDialog}
                                    color="primary"
                                >
                                    Cancel
                                </MUIButton>
                                <MUIButton
                                    type="submit"
                                    color="primary"
                                    disabled={
                                        !values.email
                                    }
                                >
                                    Submit
                                </MUIButton>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>

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
                {file ? file.name : "Drag and drop the client secret json file here"}
            </div>

            <Link to="/google/credentialyt">
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

export default CredentialsCreator;
