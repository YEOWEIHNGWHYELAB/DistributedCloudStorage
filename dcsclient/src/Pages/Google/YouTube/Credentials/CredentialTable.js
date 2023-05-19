import React, { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import styled from "styled-components";
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

import RequestCredential from "../../../../Hooks/RequestCredential"
import { fileTableStyle } from "../../../../Windows/TableStyle";
import { deleteDialogPrompt } from "../../../../Windows/DialogBox";

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
        addResource,
        getResourceList,
        resourceList,
        updateResource,
        deleteResource,
        deleteSelectedResource,
    } = RequestCredential({
        endpoint: "github/credentials",
        resourceLabel: "GitHub Credentials",
    });

    return (
        <div>
            <h2 style={{ textAlign: "left" }}>My Google Credentials</h2>

            {/* <StyledTable>
                <thead>
                    <StyledHeaderRow>
                        <StyledHeaderCell>Select</StyledHeaderCell>

                        <StyledHeaderCell
                            // className={
                            //     sortField === "github_username"
                            //         ? `sortable ${sortDirection}`
                            //         : "sortable"
                            // }
                            // onClick={() => handleSort("github_username")}
                            // style={{ sortField }}
                        >
                            Username
                        </StyledHeaderCell>

                        <StyledHeaderCell
                            // className={
                            //     sortField === "email"
                            //         ? `sortable ${sortDirection}`
                            //         : "sortable"
                            // }
                            // onClick={() => handleSort("email")}
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
                                    // onClick={() =>
                                    //     handleOpenEdit(credential.id, {
                                    //         id: credential.id,
                                    //         github_username:
                                    //             credential.github_username,
                                    //         email: credential.email,
                                    //         access_token:
                                    //             credential.access_token,
                                    //     })
                                    // }
                                >
                                    <EditIcon />
                                </IconButton>

                                <IconButton
                                    // onClick={() =>
                                    //     handleOpenDeleteDialog(credential.id)
                                    // }
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </StyledCell>
                        </StyledRow>
                    ))}
                </tbody>
            </StyledTable> */}
        </div>
    );
}

export default CredentialTable;
