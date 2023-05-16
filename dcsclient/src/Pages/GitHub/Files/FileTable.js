import React, { useEffect, useState } from "react";
import RequestGitHubResource from "../../../Hooks/RequestGitHubResource";
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
        getAllFiles,
        resourceList,
        updateResource,
        deleteResource,
        deleteSelectedResource,
    } = RequestGitHubResource({
        endpoint: "github/files",
        resourceLabel: "Files",
    });

    // {page: 1, limit: 10}
    useEffect(() => {
        getAllFiles();
    }, [getAllFiles]);

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
                        <StyledHeaderCell
                            style={{
                                width: "10%"
                            }}
                        >
                            Select
                        </StyledHeaderCell>

                        <StyledHeaderCell>
                            Filename
                        </StyledHeaderCell>

                        <StyledHeaderCell>
                            Actions
                        </StyledHeaderCell>
                    </StyledHeaderRow>
                </thead>
                {<tbody>
                    {resourceList.results.map((files) => (
                        <StyledRow key={files.id}>
                            <StyledCell>
                                <input
                                    type="checkbox"
                                />
                            </StyledCell>
                            <StyledCell>
                                {files.filename}
                            </StyledCell>

                            <StyledCell>
                                <IconButton>
                                    <EditIcon />
                                </IconButton>

                                <IconButton>
                                    <DeleteIcon />
                                </IconButton>
                            </StyledCell>
                        </StyledRow>
                    ))}
                </tbody>}
            </StyledTable>
        </div>
    );
}

export default FileTable;
