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

import { multiSelectDeleteUploadButtons, selectAllHandler, selectAllItemCheckbox } from "../../../../Windows/MultiOpsButton";
import {
    formContainerStyle,
    pageGoToNavigator,
    pageLimitGoToControl,
    pageNavigator,
    paginationButtons
} from "../../../../Windows/PageControl";
import { fileTableStyle } from "../../../../Windows/TableStyle";
import { deleteDialogPrompt } from "../../../../Windows/DialogBox";
import RequestResource from "../../../../Hooks/RequestResource";
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
        getFilesPaginated,
        updateVideo
    } = RequestYouTubeResourcePag({
        endpoint: "google/youtube/videos",
        resourceLabel: "Videos",
    });

    const [selectAll, setSelectAll] = useState(false);
    const [selectedElements, setSelectedElements] = useState([]);
    const handleSelectAll = selectAllHandler(selectAll, setSelectedElements, resourceList, setSelectAll);

    const [filePage, setPage] = useState(1);
    const [filePageLimit, setPageLimit] = useState(100);
    const [pageSelected, setGoToPageSelected] = useState(filePage);

    const [searchText, setSearchText] = useState("");
    const [searchTextPerm, setSearchTextPerm] = useState("");
    const handleSearchChange = (event) => {
        setSearchText(event.target.value);
    };
    const handleSearch = () => {
        setSearchTextPerm(searchText);
    };

    useEffect(() => {
        getFilesPaginated({
            page: filePage,
            limit: filePageLimit,
            search: searchTextPerm.toLocaleLowerCase(),
            is_deleted: false
        });
    }, [filePage, filePageLimit, searchTextPerm]);

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

    const [sortField, setSortField] = useState("title");
    const [sortDirection, setSortDirection] = useState("asc");

    const handleSort = sortTableColumn(sortField, setSortDirection, sortDirection, setSortField);

    sortResourceList(resourceList, sortField, sortDirection, false);

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
        // deleteFile(idDelete);
        setOpenDeleteDiaglog(false);
        setIDDelete(null);
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
        values["video_id"] = idEdit;
        // updateFile(values);
        handleEditClose();
    };

    return (
        <div>
            <h2 style={{ textAlign: "left" }}>My YouTube Videos</h2>

            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by Title"
                    style={{width: "100%"}}
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
                                {selectAllItemCheckbox(StyledCell, setSelectedElements, videos, selectedElements)}

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
                                                videos.id,
                                                videos.filename
                                            )
                                        }
                                    >
                                        <EditIcon />
                                    </IconButton>

                                    <IconButton
                                        onClick={() =>
                                            handleOpenDeleteDialog(videos.id)
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
            
            <br/>

            {pageNavigator(handlePageChange, filePage, getPageButtons, pageMax)}
        </div>
    );
}

export default VideosTable;
