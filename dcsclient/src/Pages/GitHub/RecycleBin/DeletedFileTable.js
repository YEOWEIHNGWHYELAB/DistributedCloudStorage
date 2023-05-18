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

import { fileTableStyle } from "../../../Windows/TableStyle";
import { deleteDialogPrompt, renameDialog } from "../../../Windows/DialogBox";
import { multiSelectDeleteUploadButtons } from "../../../Windows/MultiOpsButton";
import {
    pageGoToNavigator,
    pageLimitGoToControl,
    pageNavigator,
    paginationButtons
} from "../../../Windows/PageControl";
import { fileUploader, performMultipleDownload, performSingleDownload } from "../../../Windows/FilesControl";
import { sortResourceList, sortTableColumn } from "../../../Windows/TableControl";

function DeletedFileTable() {
    const { enqueueSnackbar } = useSnackbar();

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

    const [filePage, setPage] = useState(1);
    const [filePageLimit, setPageLimit] = useState(100);
    const [pageSelected, setGoToPageSelected] = useState(filePage);

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
            is_deleted: true
        });
    }, [filePage, filePageLimit, searchTextPerm, extensionTextPerm]);

    return (
        <div>
            <h2 style={{ textAlign: "left" }}>GitHub Recycle Bin</h2>

            {/* <StyledTable>
                <thead>
                    <StyledHeaderRow>
                        <StyledHeaderCell
                            style={{
                                width: "10%",
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
                                <StyledCell>
                                    <input
                                        type="checkbox"
                                        className="selection-checkbox"
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
            </StyledTable> */}
        </div>
    );
}

export default DeletedFileTable;
