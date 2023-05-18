import React, { useEffect, useState } from "react";
import RequestGitHubResource from "../../../Hooks/RequestGitHubResource";
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

import "./SearchStyle.css";
import "./PageControlStyle.css";

import { fileTableStyle } from "../../../Windows/TableStyle";
import { deleteDialogPrompt } from "../../../Windows/DialogBox";
import { multiSelectDeleteUploadButtons } from "../../../Windows/MultiOpsButton";


function FileTable() {
    const { enqueueSnackbar } = useSnackbar();

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
        deleteMulFiles,
    } = RequestGitHubResource({
        endpoint: "github/files",
        resourceLabel: "Files",
    });

    // Multi-Select
    const [selectAll, setSelectAll] = useState(false);
    const [selectedElements, setSelectedElements] = useState([]);
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedElements([]);
        } else {
            const allIds = resourceList.results.map((row) => row.id);
            setSelectedElements(allIds);
        }

        setSelectAll(!selectAll);
    };

    const [filePage, setPage] = useState(1);
    const [filePageLimit, setPageLimit] = useState(100);

    const [searchText, setSearchText] = useState("");
    const [extensionText, setExtensionText] = useState("");
    const [searchTextPerm, setSearchTextPerm] = useState("");
    const [extensionTextPerm, setExtensionTextPerm] = useState("");

    const FileNamevalidationSchema = Yup.object().shape({
        new_filename: Yup.string().required("Filename is required!"),
    });

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

    // Single Deletion
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

    // Multiple deletion
    const [deleteMulDialog, setOpendeleteMulDialog] = useState(false);

    const handleDeleteCloseMulDialog = () => {
        setOpendeleteMulDialog(false);
    };

    const handleDeleteMul = () => {
        deleteMulFiles(selectedElements);
        setOpendeleteMulDialog(false);
        setSelectedElements([]);
    };

    // Performing download single file
    const handleDownload = (id) => {
        downloadFiles({ id: [id] }, (data) => {
            const { download_url, filename } = data;

            fetch(download_url)
                .then((response) => response.blob())
                .then((blob) => {
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = blobUrl;
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(blobUrl);
                })
                .catch((error) => {
                    // console.error("Error downloading file:", error);
                    enqueueSnackbar(`Error downloading file!`);
                });
        });
    };

    // Performing multiple download
    const handleMulDownload = () => {
        downloadFiles({ id: selectedElements }, (data) => {
            if (data.download_url.length !== data.filename.length) {
                enqueueSnackbar(`Error downloading files!`);
                return;
            }

            const downloadPromises = data.download_url.map(
                async (url, index) => {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = data.filename[index];
                    a.click();
                    URL.revokeObjectURL(blobUrl);
                });

            Promise.all(downloadPromises)
                .then(() => {
                    enqueueSnackbar(`Download success!`);
                })
                .catch(error => {
                    enqueueSnackbar(`Download failed!`);
                });
        });
    };

    // Renaming
    const [idEdit, setIDEdit] = useState(null);
    const [originalFileName, setOriginalFileName] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const handleOpenEditDialog = (id, originalFileName) => {
        setIDEdit(id);
        setOriginalFileName(originalFileName);
        setOpenEditDialog(true);
    };
    const handleEditClose = () => {
        setOpenEditDialog(false);
        setIDEdit(null);
        setOriginalFileName(null);
    };
    const handleUpdateFileSubmit = (values) => {
        values["id"] = idEdit;
        updateFile(values);
        handleEditClose();
    };

    return (
        <div>
            <Dialog
                open={openEditDialog}
                onClose={handleEditClose}
                fullWidth
            >
                <DialogTitle>
                    Rename selected file
                </DialogTitle>

                <Formik
                    initialValues={{
                        new_filename: originalFileName ? originalFileName : "",
                    }}
                    onSubmit={(values, { resetForm }) => {
                        if (idEdit) {
                            handleUpdateFileSubmit(values);
                        }

                        resetForm();
                    }}
                    validationSchema={FileNamevalidationSchema}
                >
                    {({ values, errors, touched, handleChange }) => (
                        <Form>
                            <DialogContent>
                                <Field
                                    name="new_filename"
                                    as={TextField}
                                    label="New Filename"
                                    fullWidth
                                    value={values.new_filename}
                                    error={
                                        errors.new_filename &&
                                        touched.new_filename
                                    }
                                    helperText={
                                        touched.new_filename &&
                                        errors.new_filename
                                    }
                                    onChange={handleChange}
                                />
                            </DialogContent>

                            <DialogActions>
                                <MUIButton
                                    onClick={handleEditClose}
                                    color="primary"
                                >
                                    Cancel
                                </MUIButton>

                                <MUIButton
                                    type="submit"
                                    color="primary"
                                    disabled={
                                        values.new_filename ==
                                        originalFileName ||
                                        values.new_filename == ""
                                    }
                                >
                                    Rename
                                </MUIButton>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>

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

            {
                deleteDialogPrompt(deleteDialog, 
                    handleDeleteCloseDialog, 
                    handleDeleteID, 
                    "Are you sure you want to delete this file?")
            }

            {
                deleteDialogPrompt(
                    deleteMulDialog, 
                    handleDeleteCloseMulDialog, 
                    handleDeleteMul, 
                    "Are you sure you want to delete the selected files?")
            }

            {multiSelectDeleteUploadButtons(handleFileSelect, selectedElements, handleMulDownload, setOpendeleteMulDialog, selectedFiles, handleFileUpload, handleFileUploadCancel, isDraggingOver)}

            <StyledTable>
                <thead>
                    <StyledHeaderRow>
                        <StyledHeaderCell
                            style={{
                                width: "10%",
                            }}
                            onClick={
                                () => handleSelectAll()
                            }
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
                                    <input
                                        type="checkbox"
                                        className="selection-checkbox"
                                        onChange={
                                            (event) => {
                                                const isChecked = event.target.checked;

                                                setSelectedElements(
                                                    (prevSelectedElements) => {
                                                        if (isChecked) {
                                                            return [
                                                                ...prevSelectedElements,
                                                                files.id,
                                                            ];
                                                        } else {
                                                            return prevSelectedElements.filter(
                                                                (id) =>
                                                                    id !== files.id
                                                            );
                                                        }
                                                    }
                                                );
                                            }}
                                        checked={selectedElements.includes(
                                            files.id
                                        )}
                                    />
                                </StyledCell>

                                <StyledCell>{files.filename}</StyledCell>

                                <StyledCell>
                                    {moment(files.created_at).format(
                                        "hh:mm A DD-MMM-YYYY"
                                    )}
                                </StyledCell>

                                <StyledCell>
                                    <IconButton
                                        onClick={() => handleDownload(files.id)}
                                    >
                                        <DownloadIcon />
                                    </IconButton>

                                    <IconButton
                                        onClick={() =>
                                            handleOpenEditDialog(
                                                files.id,
                                                files.filename
                                            )
                                        }
                                    >
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
