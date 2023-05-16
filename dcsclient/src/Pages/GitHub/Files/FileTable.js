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
import { fileTableStyle } from "./TableStyle";

function FileTable() {
    const {
        StyledTable,
        StyledHeaderRow,
        StyledHeaderCell,
        StyledRow,
        StyledCell,
    } = fileTableStyle();

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
    const [filePageLimit, setPageLimit] = useState(10);
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
        const maxPageButtonCount = Math.min(totalPages, maxVisibleButtons);
        const sideButtonsCount = Math.floor((maxPageButtonCount - 1) / 2);
        let startPage = Math.max(filePage - sideButtonsCount, 1);
        const endPage = Math.min(
            startPage + maxPageButtonCount - 1,
            totalPages
        );

        if (endPage - startPage + 1 < maxPageButtonCount) {
            startPage = Math.max(endPage - maxPageButtonCount + 1, 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageButtons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    disabled={filePage === i}
                >
                    {i}
                </button>
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

            <label>
                Limit:
                <select value={filePageLimit} onChange={handleLimitChange}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                </select>
            </label>

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

            <div>
                <button
                    onClick={() => handlePageChange(filePage - 1)}
                    disabled={filePage === 1}
                >
                    Previous
                </button>
                {getPageButtons()}
                <button
                    onClick={() => handlePageChange(filePage + 1)}
                    disabled={filePage === pageMax}
                >
                    Next
                </button>
            </div>

            <form onSubmit={handleGoToPage}>
                <label>
                    Go to page:
                    <input
                        type="number"
                        name="pageNumberGoTo"
                        min={1}
                        max={pageMax}
                        required
                    />
                </label>
                <button type="submit">Go</button>
            </form>
        </div>
    );
}

export default FileTable;
