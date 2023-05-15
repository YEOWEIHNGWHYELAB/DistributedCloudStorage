import React, { useEffect, useState } from "react";
import RequestResource from "../../../Hooks/RequestResourceGeneric";
import { AiOutlineSearch } from "react-icons/ai";
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
    TextField,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import * as Yup from "yup";
import "./SearchBox.css";
import { fileTableStyle } from "./TableStyle" 


function FileTable() {
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
        endpoint: "github",
        resourceLabel: "Files",
    });

    const handleChange = (event) => {
        setSearchText(event.target.value);
    };

    const [searchText, setSearchText] = useState("");

    const handleSearch = () => {
        // Perform search
    };

    return (
        <div>
            <h2 style={{ textAlign: "left" }}>My GitHub Files</h2>
            <MUIButton
                style={{
                    border: "2px solid #007b00",
                    margin: "2px",
                    borderRadius: "4px",
                    padding: "8px",
                    width: "20%",
                    boxSizing: "border-box",
                }}
            >
                ADD NEW FILE
            </MUIButton>

            <MUIButton
                style={{
                    border: "2px solid #ff0000",
                    margin: "2px",
                    borderRadius: "4px",
                    padding: "8px",
                    width: "30%",
                    boxSizing: "border-box",
                    background: "transparent",
                }}
            >
                DELETE SELECTED FILE
            </MUIButton>

            <br />
            <br />

            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by Filename"
                    value={searchText}
                    onChange={handleChange}
                />
                <AiOutlineSearch
                    onClick={handleSearch}
                    className="search-icon"
                />
            </div>

            <StyledTable>
                <thead>
                    <StyledHeaderRow>
                        <StyledHeaderCell>Select</StyledHeaderCell>

                        <StyledHeaderCell
                        >
                            Username
                        </StyledHeaderCell>

                        <StyledHeaderCell
                        >
                            Email
                        </StyledHeaderCell>

                        <StyledHeaderCell>Access Token 📋</StyledHeaderCell>

                        <StyledHeaderCell>Actions</StyledHeaderCell>
                    </StyledHeaderRow>
                </thead>
                <tbody>

                </tbody>
            </StyledTable>
        </div>
    );
}

export default FileTable;
