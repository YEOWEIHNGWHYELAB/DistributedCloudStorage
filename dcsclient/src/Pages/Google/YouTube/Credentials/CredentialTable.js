import React, { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import styled from "styled-components";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import {
    Button as MUIButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select as SelectMUI,
    TextField,
} from "@mui/material";
import { useSnackbar } from "notistack";
import moment from "moment";
import { Formik, Form, Field } from "formik";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import * as Yup from "yup";
import { Link } from 'react-router-dom';

import "../../../../Windows/SearchStyle.css";

import RequestCredential from "../../../../Hooks/RequestCredential";
import { fileTableStyle } from "../../../../Windows/TableStyle";
import {
    addNewCredentialButton,
    deleteSelectedCredentialsButton,
} from "../../../../Windows/MultiOpsButton";
import { deleteDialogPrompt } from "../../../../Windows/DialogBox";
import { sortResourceList } from "../../../../Windows/TableControl";

function CredentialTable() {
    const { enqueueSnackbar } = useSnackbar();

    const {
        StyledTable,
        StyledHeaderRow,
        StyledHeaderCell,
        StyledRow,
        StyledCell,
    } = fileTableStyle();

    const {
        getCredentialList,
        credentialList,
        updateResource,
        deleteResource,
        deleteSelectedResource,
    } = RequestCredential({
        endpoint: "google/credentialsyt",
        resourceLabel: "YouTube Credentials",
    });

    useEffect(() => {
        getCredentialList();
    }, [getCredentialList]);

    const [idDelete, setIDDelete] = useState(null);
    const [openSingleDialog, setOpenSingleDialog] = useState(false);
    const [openMultiDialog, setOpenMultiDialog] = useState(false);

    const handleOpenMultiDeleteDialog = () => setOpenMultiDialog(true);
    const handleCloseMultiDeleteDialog = () => setOpenMultiDialog(false);

    const handleOpenDeleteDialog = (id) => {
        setIDDelete(id);
        setOpenSingleDialog(true);
    };

    const handleDeleteClose = () => {
        setOpenSingleDialog(false);
        setIDDelete(null);
    };

    const handleDelete = () => {
        deleteResource(idDelete);
        setOpenSingleDialog(false);
        setIDDelete(null);
    };

    const handleDeleteSelected = () => {
        deleteSelectedResource(selectedElements);
        setSelectedElements([]);
        handleCloseMultiDeleteDialog();
    };

    function copyToClipboard(oAuth2Data) {
        navigator.clipboard.writeText(oAuth2Data);
    }

    const [sortField, setSortField] = useState("email");
    const [sortDirection, setSortDirection] = useState("asc");

    const [searchTerm, setSearchTerm] = useState("");

    const handleSort = (field) => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const [idEmailEdit, setEmailIDEdit] = useState(null);
    const [currEmail, setCurrEmail] = useState();
    const [openDialogEmail, setOpenDialogEmail] = useState(false);

    const handleOpenEmailEdit = (editEmailID, emailToEdit) => {
        setEmailIDEdit(editEmailID);
        setCurrEmail(emailToEdit);
        setOpenDialogEmail(true);
    };

    const handleCloseDialogEmail = () => {
        setOpenDialogEmail(false);
        setEmailIDEdit(null);
    };

    const handleSubmitNewEmail = (values) => {
        values["id"] = idEmailEdit;
        updateResource(values);
        setEmailIDEdit(null);
        handleCloseDialogEmail();
    };

    const sortedCredentials = sortResourceList(
        credentialList,
        sortField,
        sortDirection,
        true
    );

    const filteredCredentials = sortedCredentials.filter((credential) => {
        return credential.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
    });

    const [selectedElements, setSelectedElements] = useState([]);

    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required")
    });

    return (
        <div>
            {deleteDialogPrompt(
                openSingleDialog,
                handleDeleteClose,
                handleDelete,
                "Are you sure you want to delete this Credential?"
            )}

            {deleteDialogPrompt(
                openMultiDialog,
                handleCloseMultiDeleteDialog,
                handleDeleteSelected,
                "Are you sure you want to delete selected Credentials?"
            )}

            <Dialog open={openDialogEmail} onClose={handleCloseDialogEmail} fullWidth>
                <DialogTitle>
                    Enter the email address
                </DialogTitle>

                <Formik
                    initialValues={{

                        email: idEmailEdit
                            ? currEmail.email
                            : "",
                    }}
                    onSubmit={(values) => {
                        handleSubmitNewEmail(values);
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
                                    onClick={handleCloseDialogEmail}
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

            <h2 style={{ textAlign: "left" }}>My Google Credentials</h2>

            <input
                type="text"
                placeholder="Search by Email"
                className="search-input-cred"
                value={searchTerm}
                onChange={handleSearch}
            />

            <br />
            <br />

            <Link to="/google/credentialyt/creator">
                <MUIButton
                    style={{
                        border: "2px solid #ff7bff",
                        margin: "2px",
                        borderRadius: "4px",
                        padding: "8px",
                        width: "25%",
                        boxSizing: "border-box",
                    }}
                >
                    ADD NEW CLIENT SECRET
                </MUIButton>
            </Link>

            {deleteSelectedCredentialsButton(
                selectedElements,
                handleOpenMultiDeleteDialog
            )}

            <StyledTable>
                <thead>
                    <StyledHeaderRow>
                        <StyledHeaderCell>Select</StyledHeaderCell>

                        <StyledHeaderCell
                            className={
                                sortField === "email"
                                    ? `sortable ${sortDirection}`
                                    : "sortable"
                            }
                            onClick={() => handleSort("email")}
                        >
                            Email
                        </StyledHeaderCell>

                        <StyledHeaderCell>OAuth 2.0 Data 📋</StyledHeaderCell>

                        <StyledHeaderCell>Actions</StyledHeaderCell>
                    </StyledHeaderRow>
                </thead>
                <tbody>
                    {filteredCredentials.map((credential) => (
                        <StyledRow key={credential.id}>
                            <StyledCell>
                                <input
                                    type="checkbox"
                                    onChange={(event) => {
                                        const isChecked = event.target.checked;

                                        setSelectedElements(
                                            (prevSelectedElements) => {
                                                if (isChecked) {
                                                    return [
                                                        ...prevSelectedElements,
                                                        credential.id,
                                                    ];
                                                } else {
                                                    return prevSelectedElements.filter(
                                                        (id) =>
                                                            id !== credential.id
                                                    );
                                                }
                                            }
                                        );
                                    }}
                                    checked={selectedElements.includes(
                                        credential.id
                                    )}
                                />
                            </StyledCell>

                            <StyledCell>{credential.email}</StyledCell>
                            <StyledCell>
                                <IconButton
                                    onClick={() => {
                                        copyToClipboard(
                                            JSON.stringify(credential.data)
                                        );
                                    }}
                                >
                                    <FontAwesomeIcon
                                        icon={faClipboard}
                                        title="Copy"
                                    />
                                </IconButton>
                            </StyledCell>

                            <StyledCell>
                                <IconButton
                                    onClick={() =>
                                        handleOpenEmailEdit(credential.id, {
                                            id: credential.id,
                                            email: credential.email
                                        })
                                    }
                                >
                                    <EditIcon />
                                </IconButton>

                                <IconButton
                                    onClick={() =>
                                        handleOpenDeleteDialog(credential.id)
                                    }
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </StyledCell>
                        </StyledRow>
                    ))}
                </tbody>
            </StyledTable>
        </div>
    );
}

export default CredentialTable;
