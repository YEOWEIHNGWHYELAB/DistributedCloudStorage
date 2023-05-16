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
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select as SelectMUI,
    TextField,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { FaArrowRight } from "react-icons/fa";
import * as Yup from "yup";
import "./SearchStyle.css";
import "./PageControlStyle.css";
import { fileTableStyle } from "./TableStyle";
import { Height } from "@mui/icons-material";

function FileTable() {
    const {
        StyledTable,
        StyledHeaderRow,
        StyledHeaderCell,
        StyledRow,
        StyledCell,
    } = fileTableStyle();

    const FormContainer = styled(FormControl)`
        display: flex;
        flex-direction: row;
        align-items: center;
    `;

    const {
        resourceList,
        pageMax,
        addFiles,
        getAllFiles,
        getFilesPaginated,
        updateFile,
        deleteFile,
    } = RequestGitHubResource({
        endpoint: "github/files",
        resourceLabel: "Files",
    });

    const [filePage, setPage] = useState(1);
    const [filePageLimit, setPageLimit] = useState(100);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        getFilesPaginated({ page: filePage, limit: filePageLimit });
    }, [filePage, filePageLimit]);

    const handlePageChange = (pageNumber) => {
        setPage(pageNumber);
    };

    const handleLimitChange = (event) => {
        setPageLimit(parseInt(event.target.value));

        // Reset page to 1 when the limit changes
        setPage(1);
    };

    const getPageButtons = () => {
        const pageButtons = [];
        const maxVisibleButtons = 5;

        const maxPageButtonCount = Math.min(pageMax, maxVisibleButtons);
        const sideButtonsCount = Math.floor((maxPageButtonCount - 1) / 2);

        let startPage = Math.max(filePage - sideButtonsCount, 1);

        const endPage = Math.min(startPage + maxPageButtonCount - 1, pageMax);

        if (endPage - startPage + 1 < maxPageButtonCount) {
            startPage = Math.max(endPage - maxPageButtonCount + 1, 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageButtons.push(
                <MUIButton
                    style={{
                        border: "2px solid #555",
                        margin: "2px",
                        borderRadius: "4px",
                        padding: "8px",
                        boxSizing: "border-box",
                    }}
                    key={i}
                    onClick={() => handlePageChange(i)}
                    disabled={filePage === i}
                >
                    {i}
                </MUIButton>
            );
        }

        return pageButtons;
    };

    const handleGoToPage = (event) => {
        event.preventDefault();

        const pageNumber = parseInt(event.target.pageNumberGoTo.value);

        if (pageNumber >= 1 && pageNumber <= pageMax) {
            setPage(pageNumber);
        }
    };

    const [searchText, setSearchText] = useState("");

    const handleChange = (event) => {
        setSearchText(event.target.value);
    };

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

            <br />

            <FormContainer>
                <SelectMUI
                    value={filePageLimit}
                    margin="normal"
                    onChange={handleLimitChange}
                    style={{
                        height: '40px'
                    }}
                >
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                    <MenuItem value={1000}>1000</MenuItem>
                </SelectMUI>

                <form onSubmit={handleGoToPage}>
                    <input
                        placeholder="Page"
                        type="number"
                        className="gotopage-input"
                        name="pageNumberGoTo"
                        min={1}
                        max={pageMax}
                        required
                    ></input>
                    <MUIButton
                        style={{
                            border: "2px solid #007b00",
                            margin: "2px",
                            borderRadius: "4px",
                            padding: "8px",
                            boxSizing: "border-box"
                        }}
                        className="gotopage-button"
                        type="submit"
                    >
                        Go to Page
                    </MUIButton>
                </form>
            </FormContainer>

            <StyledTable>
                <thead>
                    <StyledHeaderRow>
                        <StyledHeaderCell
                            style={{
                                width: "10%",
                            }}
                        >
                            Select
                        </StyledHeaderCell>

                        <StyledHeaderCell>Filename</StyledHeaderCell>

                        <StyledHeaderCell>Actions</StyledHeaderCell>
                    </StyledHeaderRow>
                </thead>
                {
                    <tbody>
                        {resourceList.results.map((files) => (
                            <StyledRow key={files.id}>
                                <StyledCell>
                                    <input type="checkbox" />
                                </StyledCell>
                                <StyledCell>{files.filename}</StyledCell>

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
                    </tbody>
                }
            </StyledTable>

            <br />

            <div>
                <MUIButton
                    style={{
                        border: "2px solid #555",
                        margin: "2px",
                        borderRadius: "4px",
                        padding: "8px",
                        width: "20%",
                        boxSizing: "border-box",
                    }}
                    onClick={() => handlePageChange(filePage - 1)}
                    disabled={filePage === 1}
                >
                    Previous Page
                </MUIButton>

                {getPageButtons()}

                <MUIButton
                    style={{
                        border: "2px solid #555",
                        margin: "2px",
                        borderRadius: "4px",
                        padding: "8px",
                        width: "20%",
                        boxSizing: "border-box",
                    }}
                    onClick={() => handlePageChange(filePage + 1)}
                    disabled={filePage === pageMax}
                >
                    Next Page
                </MUIButton>
            </div>
        </div>
    );
}

export default FileTable;
