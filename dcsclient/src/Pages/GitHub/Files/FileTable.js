import React, { useEffect, useState } from "react";
import RequestGitHubResource from "../../../Hooks/RequestGitHubResource";
import { AiOutlineSearch } from "react-icons/ai";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard, faArrowRight } from "@fortawesome/free-solid-svg-icons";
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
import moment from 'moment';
import { Formik, Form, Field } from "formik";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import * as Yup from "yup";
import "./SearchStyle.css";
import "./PageControlStyle.css";
import { fileTableStyle } from "./TableStyle";


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
        justify-content: flex-end;
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

    const [searchText, setSearchText] = useState("");
    const [extensionText, setExtensionText] = useState("");
    const [searchTextPerm, setSearchTextPerm] = useState("");
    const [extensionTextPerm, setExtensionTextPerm] = useState("");

    useEffect(() => {
        getFilesPaginated({ page: filePage, limit: filePageLimit, search: searchTextPerm.toLocaleLowerCase(), extension: extensionTextPerm.toLocaleLowerCase() });
    }, [filePage, filePageLimit, searchTextPerm, extensionTextPerm]);

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

    const [pageSelected, goToPageSelected] = useState(filePage);

    const handleChangeNavPage = (event) => {
        goToPageSelected(event.target.value);
    };

    const handleGoToPage = () => {
        if (pageSelected === filePage) {
            alert("Already on the page!");
        } else if (pageSelected >= 1 && pageSelected <= pageMax) {
            setPage(pageSelected);
        } else {
            if (pageMax === 1) {
                alert("There is only 1 page!");
                return;
            }
            alert(`Page number must be between 1 and ${pageMax}!`);
        }
    };

    const [sortField, setSortField] = useState("filename");
    const [sortDirection, setSortDirection] = useState("asc");

    const handleSort = (field) => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
        }
    };

    resourceList.results.sort((a, b) => {
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

    const handleSearchChange = (event) => {
        setSearchText(event.target.value);
    };

    
    const handleExtensionChange = (event) => {
        setExtensionText(event.target.value);
    };

    const handleSearch = () => {
        setExtensionTextPerm(extensionText);
        setSearchTextPerm(searchText);
    };

    return (
        <div>
            <h2 style={{ textAlign: "left" }}>My GitHub Files</h2>

            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by Filename"
                    value={searchText}
                    onChange={handleSearchChange}
                />

                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by Extension"
                    value={extensionText}
                    onChange={handleExtensionChange}
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
                        height: '40px',
                        verticalAlign: 'middle'
                    }}
                >
                    <MenuItem value={1}>1 in Page</MenuItem>
                    <MenuItem value={5}>5 in Page</MenuItem>
                    <MenuItem value={10}>10 in Page</MenuItem>
                    <MenuItem value={50}>50 in Page</MenuItem>
                    <MenuItem value={100}>100 in Page</MenuItem>
                    <MenuItem value={1000}>1000 in Page</MenuItem>
                </SelectMUI>

                <form>
                    <input
                        placeholder="Page"
                        type="number"
                        className="gotopage-input"
                        defaultValue={filePage}
                        onChange={handleChangeNavPage}
                        value={pageSelected}
                        min={1}
                        max={pageMax}
                        required
                    >
                    </input>

                    <FontAwesomeIcon
                        icon={faArrowRight}
                        onClick={handleGoToPage}
                        className="gotopage-icon"
                    />
                </form>
            </FormContainer>

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

                        <StyledHeaderCell
                            className={
                                sortField === "filename"
                                    ? `sortable ${sortDirection}`
                                    : "sortable"
                            }
                            onClick={() => handleSort("filename")}
                            style={{ sortField }}
                        >
                            Filename
                        </StyledHeaderCell>


                        <StyledHeaderCell
                            className={
                                sortField === "created_at"
                                    ? `sortable ${sortDirection}`
                                    : "sortable"
                            }
                            onClick={() => handleSort("created_at")}
                            style={{ sortField }}
                        >
                            Date Created
                        </StyledHeaderCell>

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

                                <StyledCell>
                                    {files.filename}
                                </StyledCell>

                                <StyledCell>
                                    {moment(files.created_at).format('hh:mm A DD-MMM-YYYY')}
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
                        width: "5%",
                        boxSizing: "border-box",
                    }}
                    onClick={() => handlePageChange(filePage - 1)}
                    disabled={filePage === 1}
                >
                    &lt;
                </MUIButton>

                {getPageButtons()}

                <MUIButton
                    style={{
                        border: "2px solid #555",
                        margin: "2px",
                        borderRadius: "4px",
                        padding: "8px",
                        width: "5%",
                        boxSizing: "border-box",
                    }}
                    onClick={() => handlePageChange(filePage + 1)}
                    disabled={filePage === pageMax}
                >
                    &gt;
                </MUIButton>
            </div>
        </div>
    );
}

export default FileTable;
