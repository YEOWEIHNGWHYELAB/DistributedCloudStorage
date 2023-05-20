import React, { useEffect, useState, useRef } from "react";
import RequestGitHubResource from "../../../Hooks/RequestResource";
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

import "../../../Windows/SearchStyle.css";
import "../../../Windows/PageControlStyle.css";

import { fileTableStyle } from "../../../Windows/TableStyle";
import { deleteDialogPrompt, renameDialog } from "../../../Windows/DialogBox";
import { multiSelectDeleteUploadButtons, selectAllHandler, selectAllItemCheckbox } from "../../../Windows/MultiOpsButton";
import {
    formContainerStyle,
    pageGoToNavigator,
    pageLimitGoToControl,
    pageNavigator,
    paginationButtons
} from "../../../Windows/PageControl";
import { fileUploader, performMultipleDownload, performSingleDownload } from "../../../Windows/FilesControl";
import { sortResourceList, sortTableColumn } from "../../../Windows/TableControl";

function FileTable() {
    const { enqueueSnackbar } = useSnackbar();

    const {
        StyledTable,
        StyledHeaderRow,
        StyledHeaderCell,
        StyledRow,
        StyledCell,
    } = fileTableStyle();

    const FormContainer = formContainerStyle();

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
    const handleSelectAll = selectAllHandler(selectAll, setSelectedElements, resourceList, setSelectAll);

    const [filePage, setPage] = useState(1);
    const [filePageLimit, setPageLimit] = useState(100);
    const [pageSelected, setGoToPageSelected] = useState(filePage);

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
            is_deleted: false
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

    const getPageButtons = paginationButtons(pageMax, filePage, handlePageChange);

    const handleChangeNavPage = (event) => {
        setGoToPageSelected(event.target.value);
    };

    const handleGoToPage = pageGoToNavigator(pageSelected, filePage, pageMax, setPage);

    const [sortField, setSortField] = useState("filename");
    const [sortDirection, setSortDirection] = useState("asc");

    const handleSort = sortTableColumn(sortField, setSortDirection, sortDirection, setSortField);

    sortResourceList(resourceList, sortField, sortDirection, false);

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
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(files);
    };

    const handleFileUpload = fileUploader(selectedFiles, addFile, setSelectedFiles, addMulFiles);

    const handleFileUploadCancel = () => {
        setSelectedFiles([]);

        if (fileInputRef.current) {
            fileInputRef.current.value = null; // Clear file input value
        }
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
        deleteMulFiles(selectedElements, true);
        setOpendeleteMulDialog(false);
        setSelectedElements([]);
    };

    // Performing download single file
    const handleDownload = performSingleDownload(downloadFiles, enqueueSnackbar);

    // Performing multiple download
    const handleMulDownload = performMultipleDownload(downloadFiles, selectedElements, enqueueSnackbar);

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
            {renameDialog(
                openEditDialog,
                handleEditClose,
                originalFileName,
                idEdit,
                handleUpdateFileSubmit,
                FileNamevalidationSchema
            )}

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

            {pageLimitGoToControl(
                FormContainer,
                filePageLimit,
                handleLimitChange,
                handleChangeNavPage,
                pageSelected,
                pageMax,
                handleGoToPage
            )}

            {deleteDialogPrompt(
                deleteDialog,
                handleDeleteCloseDialog,
                handleDeleteID,
                "Are you sure you want to delete this file?"
            )}

            {deleteDialogPrompt(
                deleteMulDialog,
                handleDeleteCloseMulDialog,
                handleDeleteMul,
                "Are you sure you want to delete the selected files?"
            )}

            {multiSelectDeleteUploadButtons(
                handleFileSelect,
                selectedElements,
                handleMulDownload,
                setOpendeleteMulDialog,
                selectedFiles,
                handleFileUpload,
                handleFileUploadCancel,
                isDraggingOver,
                fileInputRef
            )}

            <StyledTable>
                <thead>
                    <StyledHeaderRow>
                        <StyledHeaderCell
                            style={{
                                width: "5%",
                            }}
                            onClick={() => handleSelectAll()}
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
                                {selectAllItemCheckbox(StyledCell, setSelectedElements, files, selectedElements)}

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

            {pageNavigator(handlePageChange, filePage, getPageButtons, pageMax)}
        </div>
    );
}

export default FileTable;
