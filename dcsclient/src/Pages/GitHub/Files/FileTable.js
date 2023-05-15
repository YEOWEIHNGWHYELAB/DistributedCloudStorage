import React, { useEffect, useState } from "react";
import RequestResource from "../../../Hooks/RequestResourceGeneric";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import {
    Button as MUIButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import * as Yup from "yup";

function FileTable() {
    const { addResource, getResourceList, resourceList, updateResource, deleteResource, deleteSelectedResource } = RequestResource({
        endpoint: "github/credentials",
        resourceLabel: "GitHub Credentials",
    });

    return (
        <div>
            <MUIButton
                style={{
                    border: "2px solid #ff7bff",
                    margin: "2px",
                    borderRadius: "4px",
                    padding: "8px",
                    width: "20%",
                    boxSizing: "border-box",
                    color: "#ff0",
                    backgroundColor: "black"
                }}
            >
                ADD NEW CREDENTIAL
            </MUIButton>

            <MUIButton
                style={{
                    border: "2px solid #ff0000",
                    margin: "2px",
                    borderRadius: "4px",
                    padding: "8px",
                    width: "30%",
                    boxSizing: "border-box",
                    color: "#ff0",
                    backgroundColor: "black"
                }}
            >
                Delete Selected Credentials
            </MUIButton>

            <br/>
            <br/>

            <input
                type="text"
                placeholder="Search by Username or Email"
                style={{
                    border: "2px solid #007bff",
                    borderRadius: "4px",
                    padding: "8px",
                    width: "100%",
                    boxSizing: "border-box",
                    color: "#007bff",
                    backgroundColor: "transparent",
                }}
            />
        </div>
    );
}

export default FileTable;
