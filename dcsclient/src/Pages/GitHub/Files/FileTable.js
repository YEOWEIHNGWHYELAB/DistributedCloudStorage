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
import moment from "moment";
import { Formik, Form, Field } from "formik";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import * as Yup from "yup";
import "./SearchStyle.css";
import "./PageControlStyle.css";
import { fileTableStyle } from "./TableStyle";
import { red } from "@mui/material/colors";

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
        addFile,
        addMulFiles,
        downloadFiles,
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
        getFilesPaginated({
            page: filePage,
            limit: filePageLimit,
            search: searchTextPerm.toLocaleLowerCase(),
            extension: extensionTextPerm.toLocaleLowerCase(),
        });
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

    // Handling of file uploads
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDraggingOver(false);
        const files = Array.from(event.dataTransfer.files);
        setSelectedFiles(files);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDraggingOver(true);
    };

    const handleDragLeave = () => {
        setIsDraggingOver(false);
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(files);
    };

    const handleFileUpload = () => {
        if (selectedFiles.length > 0) {
            const formData = new FormData();

            if (selectedFiles.length === 1) {
                formData.append(`File`, selectedFiles[0]);

                addFile(formData, () => {
                    // Reset selected files state after upload
                    setSelectedFiles([]);

                    window.location.reload();
                });
            } else {
                selectedFiles.forEach((file, index) => {
                    formData.append(`File`, file);
                });

                // Perform API call to post formData to the backend
                addMulFiles(formData, () => {
                    setSelectedFiles([]);

                    window.location.reload();
                });
            }
        }
    };

    const handleFileUploadCancel = () => {
        setSelectedFiles([]);
    };

    useEffect(() => {
        const handleDocumentDragOver = (event) => {
            event.preventDefault();
        };

        const handleDocumentDrop = (event) => {
            event.preventDefault();
            setIsDraggingOver(false);
            const files = Array.from(event.dataTransfer.files);
            setSelectedFiles(files);
        };

        document.addEventListener("dragover", handleDocumentDragOver);
        document.addEventListener("drop", handleDocumentDrop);

        return () => {
            document.removeEventListener("dragover", handleDocumentDragOver);
            document.removeEventListener("drop", handleDocumentDrop);
        };
    }, []);

    // Deletion
    const [deleteDialog, setOpenDeleteDiaglog] = useState(false);
    const [idDelete, setIDDelete] = useState(null);

    const handleOpenDeleteDialog = (id) => {
        setIDDelete(id);
        setOpenDeleteDiaglog(true);
    };

    const handleDeleteCloseDialog = () => {
        setOpenDeleteDiaglog(false);
        setIDDelete(null);
    };

    const handleDeleteID = () => {
        deleteFile(idDelete);
        setOpenDeleteDiaglog(false);
        setIDDelete(null);
    };

    // Performing download single file
    const handleDownload = (id) => {
        downloadFiles({ id: [id] }, (data) => {
            const { download_url, filename } = data;
            console.log(filename[0])
            const link = document.createElement('a');
            link.href = download_url[0];
            link.setAttribute('download', filename[0]);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

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
                        height: "40px",
                        verticalAlign: "middle",
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
                    ></input>

                    <FontAwesomeIcon
                        icon={faArrowRight}
                        onClick={handleGoToPage}
                        className="gotopage-icon"
                    />
                </form>
            </FormContainer>

            <Dialog open={deleteDialog} onClose={handleDeleteCloseDialog}>
                <DialogTitle>
                    Are you sure you want to delete this file?
                </DialogTitle>

                <DialogActions>
                    <MUIButton onClick={handleDeleteID}>YES!</MUIButton>
                    <MUIButton onClick={handleDeleteCloseDialog}>NO!</MUIButton>
                </DialogActions>
            </Dialog>

            <div>
                <input
                    style={{
                        display: "none",
                    }}
                    id="file-upload"
                    multiple
                    type="file"
                    onChange={handleFileSelect}
                />
                <label htmlFor="file-upload">
                    <MUIButton
                        variant="contained"
                        component="span"
                        style={{
                            border: "2px solid #0000ff",
                            margin: "2px",
                            borderRadius: "4px",
                            padding: "8px",
                            width: "25%",
                            boxSizing: "border-box",
                            color: "green",
                            background: "transparent",
                        }}
                    >
                        Select Files For Upload
                    </MUIButton>
                </label>

                <MUIButton
                    style={{
                        border: "2px solid #ff0000",
                        margin: "2px",
                        borderRadius: "4px",
                        padding: "8px",
                        width: "20%",
                        boxSizing: "border-box",
                    }}
                >
                    DELETE SELECTED FILE
                </MUIButton>

                {selectedFiles.length > 0 && (
                    <div>
                        <p>Selected files to upload:</p>
                        <ul>
                            {selectedFiles.map((file, index) => (
                                <li key={index}>{file.name}</li>
                            ))}
                        </ul>

                        <MUIButton
                            style={{
                                border: "2px solid grey",
                                margin: "2px",
                                borderRadius: "4px",
                                padding: "8px",
                                width: "15%",
                                boxSizing: "border-box",
                            }}
                            onClick={handleFileUpload}
                        >
                            UPLOAD FILES
                        </MUIButton>

                        <MUIButton
                            style={{
                                border: "2px solid grey",
                                margin: "2px",
                                borderRadius: "4px",
                                padding: "8px",
                                width: "15%",
                                boxSizing: "border-box",
                            }}
                            onClick={handleFileUploadCancel}
                        >
                            CANCEL
                        </MUIButton>
                    </div>
                )}

                {isDraggingOver && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            border: "2px solid #ff0000",
                            zIndex: 9999,
                        }}
                    ></div>
                )}
            </div>

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

                                <StyledCell>{files.filename}</StyledCell>

                                <StyledCell>
                                    {moment(files.created_at).format(
                                        "hh:mm A DD-MMM-YYYY"
                                    )}
                                </StyledCell>

                                <StyledCell>
                                    <IconButton
                                        onClick={() =>
                                            handleDownload(files.id)
                                        }
                                    >
                                        <DownloadIcon />
                                    </IconButton>

                                    <IconButton>
                                        <EditIcon />
                                    </IconButton>

                                    <IconButton
                                        onClick={() =>
                                            handleOpenDeleteDialog(files.id)
                                        }
                                    >
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
