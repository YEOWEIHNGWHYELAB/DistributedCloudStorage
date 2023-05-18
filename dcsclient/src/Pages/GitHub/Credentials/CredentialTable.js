import React, { useEffect, useState } from "react";
import RequestResource from "../../../Hooks/RequestResourceCredential";
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

import { fileTableStyle } from "../../../Windows/TableStyle";
import { deleteDialogPrompt } from "../../../Windows/DialogBox";
import { addNewCredentialButton, deleteSelectedCredentialsButton } from "../../../Windows/MultiOpsButton";

import "./SearchStyle.css";

function CredentialsTable() {
    const {
        StyledTable,
        StyledHeaderRow,
        StyledHeaderCell,
        StyledRow,
        StyledCell,
    } = fileTableStyle();

    const {
        addResource,
        getResourceList,
        resourceList,
        updateResource,
        deleteResource,
        deleteSelectedResource,
    } = RequestResource({
        endpoint: "github/credentials",
        resourceLabel: "GitHub Credentials",
    });

    useEffect(() => {
        getResourceList();
    }, [getResourceList]);

    const [open, setOpen] = useState(false);
    const [idDelete, setIDDelete] = useState(null);
    const [idEdit, setIDEdit] = useState(null);
    const [credToEdit, setCredToEdit] = useState(null);
    const [selectedElements, setSelectedElements] = useState([]);

    const handleOpenDeleteDialog = (id) => {
        setIDDelete(id);
        setOpen(true);
    };

    const handleDeleteClose = () => {
        setOpen(false);
        setIDDelete(null);
    };

    const handleDelete = () => {
        deleteResource(idDelete);
        setOpen(false);
        setIDDelete(null);
    };

    const [openD, setOpenD] = useState(false);
    const handleOpen = () => setOpenD(true);

    const [openMultiDialog, setOpenMultiDialog] = useState(false);
    const handleOpenMultiDeleteDialog = () => setOpenMultiDialog(true);
    const handleCloseMultiDeleteDialog = () => {
        setOpenMultiDialog(false);
    };

    const handleDeleteSelected = () => {
        deleteSelectedResource(selectedElements);
        setSelectedElements([]);
        handleCloseMultiDeleteDialog();
    };

    const handleOpenEdit = (editID, credToEdit) => {
        setIDEdit(editID);
        setCredToEdit(credToEdit);
        setOpenD(true);
    };

    const handleClose = () => {
        setOpenD(false);
        setIDEdit(null);
    };

    const handleSubmit = (values) => {
        addResource(values, () => {
            window.location.reload();
        });
        handleClose();
    };

    const handleUpdateSubmit = (values) => {
        values["id"] = idEdit;
        updateResource(values);
        handleClose();
    };

    const [sortField, setSortField] = useState("github_username");
    const [sortDirection, setSortDirection] = useState("asc");

    const [searchTerm, setSearchTerm] = useState("");

    function copyToClipboard(personalAccessToken) {
        navigator.clipboard.writeText(personalAccessToken);
    }

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

    const sortedCredentials = resourceList.results.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue < bValue) {
            return sortDirection === "asc" ? -1 : 1;
        } else if (aValue > bValue) {
            return sortDirection === "asc" ? 1 : -1;
        } else {
            return 0;
        }
    });

    // filter the credentials array based on the search term
    const filteredCredentials = sortedCredentials.filter((credential) => {
        return (
            credential.github_username
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            credential.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const validationSchema = Yup.object().shape({
        github_username: Yup.string().required("Username is required"),
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
        access_token: Yup.string().required(
            "Personal Access Token is required"
        ),
    });

    return (
        <div>
            <Dialog open={openD} onClose={handleClose}>
                <DialogTitle>
                    {idEdit ? "Edit Credential" : "Add New Credential"}
                </DialogTitle>

                <Formik
                    initialValues={{
                        github_username: idEdit
                            ? credToEdit.github_username
                            : "",
                        email: idEdit ? credToEdit.email : "",
                        access_token: idEdit ? credToEdit.access_token : "",
                    }}
                    onSubmit={(values, { resetForm }) => {
                        if (idEdit) {
                            handleUpdateSubmit(values);
                        } else {
                            handleSubmit(values);
                        }

                        resetForm();
                    }}
                    validationSchema={validationSchema}
                >
                    {({ values, errors, touched, handleChange }) => (
                        <Form>
                            <DialogContent>
                                <Field
                                    name="github_username"
                                    as={TextField}
                                    label="Username"
                                    fullWidth
                                    margin="normal"
                                    value={values.github_username}
                                    error={
                                        errors.github_username &&
                                        touched.github_username
                                    }
                                    helperText={
                                        touched.username && errors.username
                                    }
                                    onChange={handleChange}
                                />
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
                                <Field
                                    name="access_token"
                                    as={TextField}
                                    label="Personal Access Token"
                                    fullWidth
                                    margin="normal"
                                    value={values.access_token}
                                    error={
                                        errors.access_token &&
                                        touched.access_token
                                    }
                                    helperText={
                                        touched.access_token &&
                                        errors.access_token
                                    }
                                    onChange={handleChange}
                                />
                            </DialogContent>
                            <DialogActions>
                                <MUIButton
                                    onClick={handleClose}
                                    color="primary"
                                >
                                    Cancel
                                </MUIButton>
                                <MUIButton
                                    type="submit"
                                    color="primary"
                                    disabled={
                                        !values.github_username ||
                                        !values.email ||
                                        !values.access_token
                                    }
                                >
                                    {idEdit ? "Edit" : "Add"}
                                </MUIButton>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>

            {deleteDialogPrompt(
                open,
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

            <h2 style={{ textAlign: "left" }}>My GitHub Credentials</h2>

            <input
                type="text"
                placeholder="Search by Username or Email"
                className="search-input-cred"
                value={searchTerm}
                onChange={handleSearch}
            />

            <br />
            <br />

            {addNewCredentialButton(handleOpen)}

            {deleteSelectedCredentialsButton(selectedElements, handleOpenMultiDeleteDialog)}

            <StyledTable>
                <thead>
                    <StyledHeaderRow>
                        <StyledHeaderCell>Select</StyledHeaderCell>

                        <StyledHeaderCell
                            className={
                                sortField === "github_username"
                                    ? `sortable ${sortDirection}`
                                    : "sortable"
                            }
                            onClick={() => handleSort("github_username")}
                            style={{ sortField }}
                        >
                            Username
                        </StyledHeaderCell>

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

                        <StyledHeaderCell>Access Token 📋</StyledHeaderCell>

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
                            <StyledCell>
                                {credential.github_username}
                            </StyledCell>

                            <StyledCell>{credential.email}</StyledCell>
                            <StyledCell>
                                <IconButton
                                    onClick={() =>
                                        copyToClipboard(credential.access_token)
                                    }
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
                                        handleOpenEdit(credential.id, {
                                            id: credential.id,
                                            github_username:
                                                credential.github_username,
                                            email: credential.email,
                                            access_token:
                                                credential.access_token,
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

export default CredentialsTable;
