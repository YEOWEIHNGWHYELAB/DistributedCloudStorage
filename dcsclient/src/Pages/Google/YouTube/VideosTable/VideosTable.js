import React, { useEffect, useState } from "react";
import RequestYouTubeResourcePag from "../../../../Hooks/RequestResource";
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

import RequestResource from "../../../../Hooks/RequestResource";

import { multiSelectDeleteUploadButtons, selectAllVideoHandler, selectAllVideosCheckbox } from "../../../../Windows/MultiOpsButton";
import {
    formContainerStyle,
    pageGoToNavigator,
    pageLimitGoToControl,
    pageNavigator,
    paginationButtons
} from "../../../../Windows/PageControl";
import { fileTableStyle } from "../../../../Windows/TableStyle";
import { deleteDialogPrompt, editSelectedVideoDialog } from "../../../../Windows/DialogBox";
import { fileUploader, performMultipleDownload, performSingleDownload } from "../../../../Windows/FilesControl";
import { sortResourceList, sortTableColumn } from "../../../../Windows/TableControl";

function VideosTable() {
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
        getFilesPaginated,
        updateVideo,
        deleteMulFiles
    } = RequestYouTubeResourcePag({
        endpoint: "google/youtube/videos",
        resourceLabel: "Videos",
    });

    const [selectAll, setSelectAll] = useState(false);
    const [selectedElements, setSelectedElements] = useState([]);
    const handleSelectAll = selectAllVideoHandler(selectAll, setSelectedElements, resourceList, setSelectAll);

    // Page Controls
    const [filePage, setPage] = useState(1);
    const [filePageLimit, setPageLimit] = useState(100);
    const [pageSelected, setGoToPageSelected] = useState(filePage);
    const handlePageChange = (pageNumber) => {
        setPage(pageNumber);
    };
    const handleLimitChange = (event) => {
        setPageLimit(parseInt(event.target.value));
        setPage(1);
    };
    const getPageButtons = paginationButtons(pageMax, filePage, handlePageChange);
    const handleChangeNavPage = (event) => {
        setGoToPageSelected(event.target.value);
    };
    const handleGoToPage = pageGoToNavigator(pageSelected, filePage, pageMax, setPage);

    // Search Controls
    const [searchText, setSearchText] = useState("");
    const [searchTextPerm, setSearchTextPerm] = useState("");
    const handleSearchChange = (event) => {
        setSearchText(event.target.value);
    };
    const handleSearch = () => {
        setSearchTextPerm(searchText);
    };

    // Sorting controls
    const [sortField, setSortField] = useState("title");
    const [sortDirection, setSortDirection] = useState("asc");
    const handleSort = sortTableColumn(sortField, setSortDirection, sortDirection, setSortField);
    sortResourceList(resourceList, sortField, sortDirection, false);

    // Main Page Controls
    useEffect(() => {
        getFilesPaginated({
            page: filePage,
            limit: filePageLimit,
            search: searchTextPerm.toLocaleLowerCase(),
            is_deleted: false
        });
    }, [filePage, filePageLimit, searchTextPerm]);

    // Renaming Controls
    const [idEdit, setIDEdit] = useState(null);
    const [originalVideoTitle, setOriginalFileName] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const handleOpenEditDialog = (id, title) => {
        setOriginalFileName(title);
        setIDEdit(id);
        setOpenEditDialog(true);
    };
    const handleEditClose = () => {
        setOpenEditDialog(false);
        setIDEdit(null);
        setOriginalFileName(null);
    };
    const handleUpdateVideoSubmit = (values) => {
        let newValues = {
            video_id: idEdit,
            title: values.new_title
        }

        updateVideo(newValues);
        handleEditClose();
    };
    const videoMetaValidationSchema = Yup.object().shape({
        new_title: Yup.string().required("Title is required!"),
    });

    // Handling single deletion
    const [deleteDialog, setOpenDeleteDiaglog] = useState(false);
    const [idDelete, setIDDelete] = useState(null);
    const handleOpenDeleteDialog = (id) => {
        setIDDelete(id);
        setOpenDeleteDiaglog(true);
    };
    const handleDeleteID = () => {
        deleteMulFiles([idDelete], true);
        setOpenDeleteDiaglog(false);
        setIDDelete(null);
    };
    const handleDeleteCloseDialog = () => {
        setOpenDeleteDiaglog(false);
        setIDDelete(null);
    };


    // Handling of file uploads
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(files);
    };

    const handleFileUploadCancel = () => {
        setSelectedFiles([]);
    };
    const handleFileUpload = fileUploader(selectedFiles, addFile, setSelectedFiles, addMulFiles);

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

    return (
        <div>
            {editSelectedVideoDialog(
                openEditDialog,
                handleEditClose,
                originalVideoTitle,
                idEdit,
                handleUpdateVideoSubmit,
                videoMetaValidationSchema
            )}

            <h2 style={{ textAlign: "left" }}>My YouTube Videos</h2>

            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by Title"
                    style={{ width: "100%" }}
                    value={searchText}
                    onChange={handleSearchChange}
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
                "Are you sure you want to delete this video?"
            )}

            {deleteDialogPrompt(
                deleteMulDialog,
                handleDeleteCloseMulDialog,
                handleDeleteMul,
                "Are you sure you want to delete the selected videos?"
            )}

            {multiSelectDeleteUploadButtons(
                handleFileSelect,
                selectedElements,
                handleMulDownload,
                setOpendeleteMulDialog,
                selectedFiles,
                handleFileUpload,
                handleFileUploadCancel,
                isDraggingOver
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
                                sortField === "title"
                                    ? `sortable ${sortDirection}`
                                    : "sortable"
                            }
                            onClick={() => handleSort("title")}
                            style={{ sortField }}
                        >
                            Video Title
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
                        {resourceList.results.map((videos) => (
                            <StyledRow key={videos.video_id}>
                                {selectAllVideosCheckbox(StyledCell, setSelectedElements, videos, selectedElements)}

                                <StyledCell>{videos.title}</StyledCell>

                                <StyledCell>
                                    {moment(videos.created_at).format(
                                        "hh:mm A DD-MMM-YYYY"
                                    )}
                                </StyledCell>

                                <StyledCell>
                                    <IconButton>
                                        <DownloadIcon />
                                    </IconButton>

                                    <IconButton
                                        onClick={() =>
                                            handleOpenEditDialog(
                                                videos.video_id,
                                                videos.title
                                            )
                                        }
                                    >
                                        <EditIcon />
                                    </IconButton>

                                    <IconButton
                                        onClick={() =>
                                            handleOpenDeleteDialog(videos.video_id)
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

export default VideosTable;
