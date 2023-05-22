import React, { useEffect, useState } from "react";
import RequestGitHubResource from "../../../../Hooks/RequestResource";
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
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import * as Yup from "yup";

import RequestYTDeletedResource from "../../../../Hooks/RequestResource";

import {
    selectAllVideoHandler,
    selectAllVideosCheckbox,
} from "../../../../Windows/MultiOpsButton";
import {
    formContainerStyle,
    pageGoToNavigator,
    pageLimitGoToControl,
    pageNavigator,
    paginationButtons,
} from "../../../../Windows/PageControl";
import { fileTableStyle } from "../../../../Windows/TableStyle";
import {
    sortResourceList,
    sortTableColumn,
} from "../../../../Windows/TableControl";

function YTDeletedFileTable() {
    const {
        StyledTable,
        StyledHeaderRow,
        StyledHeaderCell,
        StyledRow,
        StyledCell,
    } = fileTableStyle();

    const FormContainer = formContainerStyle();

    const { resourceList, pageMax, getFilesPaginated, deleteMulFiles } =
        RequestYTDeletedResource({
            endpoint: "google/youtube/videos",
            resourceLabel: "Videos",
        });

    const [searchText, setSearchText] = useState("");
    const [searchTextPerm, setSearchTextPerm] = useState("");
    const handleSearchChange = (event) => {
        setSearchText(event.target.value);
    };
    const handleSearch = () => {
        setSearchTextPerm(searchText);
    };

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
    const getPageButtons = paginationButtons(
        pageMax,
        filePage,
        handlePageChange
    );
    const handleChangeNavPage = (event) => {
        setGoToPageSelected(event.target.value);
    };
    const handleGoToPage = pageGoToNavigator(
        pageSelected,
        filePage,
        pageMax,
        setPage
    );

    const [selectAll, setSelectAll] = useState(false);
    const [selectedElements, setSelectedElements] = useState([]);
    const handleSelectAll = selectAllVideoHandler(
        selectAll,
        setSelectedElements,
        resourceList,
        setSelectAll
    );

    const [sortField, setSortField] = useState("title");
    const [sortDirection, setSortDirection] = useState("asc");
    const handleSort = sortTableColumn(
        sortField,
        setSortDirection,
        sortDirection,
        setSortField
    );
    sortResourceList(resourceList, sortField, sortDirection, false);

    useEffect(() => {
        getFilesPaginated({
            page: filePage,
            limit: filePageLimit,
            search: searchTextPerm.toLocaleLowerCase(),
            is_deleted: true,
        });
    }, [filePage, filePageLimit, searchTextPerm]);

    return (
        <div>
            <h2 style={{ textAlign: "left" }}>YouTube Recycle Bin</h2>

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

            <div>
                <MUIButton
                    style={{
                        border: "2px solid #ff0000",
                        margin: "2px",
                        borderRadius: "4px",
                        padding: "8px",
                        width: "25%",
                        boxSizing: "border-box",
                    }}
                    onClick={() => {
                        if (selectedElements.length !== 0) {
                            deleteMulFiles(selectedElements, false);
                        }
                    }}
                >
                    RESTORE SELECTED FILES
                </MUIButton>
            </div>

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

                        <StyledHeaderCell
                            style={{
                                width: "5%",
                            }}
                        >
                            Actions
                        </StyledHeaderCell>
                    </StyledHeaderRow>
                </thead>
                {
                    <tbody>
                        {resourceList.results.map((videos) => (
                            <StyledRow key={videos.video_id}>
                                {selectAllVideosCheckbox(
                                    StyledCell,
                                    setSelectedElements,
                                    videos,
                                    selectedElements
                                )}

                                <StyledCell>{videos.title}</StyledCell>

                                <StyledCell>
                                    {moment(videos.created_at).format(
                                        "hh:mm A DD-MMM-YYYY"
                                    )}
                                </StyledCell>

                                <StyledCell>
                                    <IconButton
                                        onClick={() =>
                                            deleteMulFiles(
                                                [videos.video_id],
                                                false
                                            )
                                        }
                                    >
                                        <RestoreFromTrashIcon />
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

export default YTDeletedFileTable;
