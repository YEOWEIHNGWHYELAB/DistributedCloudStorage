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

    const { resourceList, pageMax, getFilesPaginated, deleteMulFiles } =
        RequestYTDeletedResource({
            endpoint: "google/youtube/videos",
            resourceLabel: "Videos",
        });

    const [searchText, setSearchText] = useState("");
    const [extensionText, setExtensionText] = useState("");
    const [searchTextPerm, setSearchTextPerm] = useState("");
    const [extensionTextPerm, setExtensionTextPerm] = useState("");

    const [filePage, setPage] = useState(1);
    const [filePageLimit, setPageLimit] = useState(100);
    const [pageSelected, setGoToPageSelected] = useState(filePage);

    const [selectAll, setSelectAll] = useState(false);
    const [selectedElements, setSelectedElements] = useState([]);
    const handleSelectAll = selectAllVideoHandler(selectAll, setSelectedElements, resourceList, setSelectAll);

    const [sortField, setSortField] = useState("filename");
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
            is_deleted: true
        });
    }, [filePage, filePageLimit, searchTextPerm, extensionTextPerm]);

    return (
        <div>
            <h2 style={{ textAlign: "left" }}>YouTube Recycle Bin</h2>

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
                                sortField === "filename"
                                    ? `sortable ${sortDirection}`
                                    : "sortable"
                            }
                            onClick={() => handleSort("filename")}
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
                                {selectAllVideosCheckbox(StyledCell, setSelectedElements, videos, selectedElements)}

                                <StyledCell>{videos.title}</StyledCell>

                                <StyledCell>
                                    {moment(videos.created_at).format(
                                        "hh:mm A DD-MMM-YYYY"
                                    )}
                                </StyledCell>

                                <StyledCell>
                                    <IconButton
                                        onClick={() =>
                                            deleteMulFiles([videos.video_id], false)
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
        </div>
    );
}

export default YTDeletedFileTable;
