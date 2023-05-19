import React, { useEffect, useState } from "react";
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
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';

import { fileTableStyle } from "../../../Windows/TableStyle";
import { selectAllHandler, selectAllItemCheckbox } from "../../../Windows/MultiOpsButton";
import {
    formContainerStyle,
    pageGoToNavigator,
    pageLimitGoToControl,
    pageNavigator,
    paginationButtons
} from "../../../Windows/PageControl";
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

    const [filePage, setPage] = useState(1);
    const [filePageLimit, setPageLimit] = useState(100);
    const [pageSelected, setGoToPageSelected] = useState(filePage);

    const [selectAll, setSelectAll] = useState(false);
    const [selectedElements, setSelectedElements] = useState([]);
    const handleSelectAll = selectAllHandler(selectAll, setSelectedElements, resourceList, setSelectAll);

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

    const [searchText, setSearchText] = useState("");
    const [extensionText, setExtensionText] = useState("");
    const [searchTextPerm, setSearchTextPerm] = useState("");
    const [extensionTextPerm, setExtensionTextPerm] = useState("");

    const [sortField, setSortField] = useState("filename");
    const [sortDirection, setSortDirection] = useState("asc");

    const handleSort = sortTableColumn(sortField, setSortDirection, sortDirection, setSortField);
    sortResourceList(resourceList, sortField, sortDirection);

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

            <div>
                <MUIButton
                    style={{
                        border: "2px solid #ff0000",
                        margin: "2px",
                        borderRadius: "4px",
                        padding: "8px",
                        width: "20%",
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
                                        onClick={() =>
                                            deleteMulFiles([files.id], false)
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

export default DeletedFileTable;
