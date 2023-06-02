import React, { useState, useEffect } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import moment from "moment";
import {
    Button as MUIButton
} from "@mui/material";
import FolderIcon from '@mui/icons-material/Folder';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';

import DirectoryDeque from "./DirectoryDeque";
import RequestSMCO from "../../Hooks/RequestSMCO";

import { fileTableStyle } from "../../Windows/TableStyle";
import { sortSMCOList, sortTableColumn } from "../../Windows/TableControl";
import "./FileExplorerStyle.css";

const FileExplorer = ({ fsManager }) => {
    const {
        StyledTable,
        StyledHeaderRow,
        StyledHeaderCell,
        StyledRow,
        StyledCell,
    } = fileTableStyle();

    const {
        resourceList,
        buildDirList,
        getAllDirBuilder,
        getAllFiles,
        moveFiles
    } = RequestSMCO({ resourceLabel: "Files" });

    // Directory navigation management
    const [dequeDir] = useState(() => new DirectoryDeque());

    // Current directory manager
    const [fileDirList, setFileDirList] = useState([]);
    const [poppedDir, setPoppedDir] = useState("");
    const [myCurrDir, setMyCurrDir] = useState(null);

    // Sorting files
    const [sortField, setSortField] = useState("filename");
    const [sortDirection, setSortDirection] = useState("asc");

    const [searchTextPerm, setSearchTextPerm] = useState("");
    const [searchText, setSearchText] = useState("");

    const [selectedItems, setSelectedItems] = useState([]);

    const [isCtrlKeyPressed, setIsCtrlKeyPressed] = useState(false);
    const [isShiftKeyPressed, setIsShiftKeyPressed] = useState(false);

    const [shiftStartIndex, setShiftStartIndex] = useState(0);

    useEffect(() => {
        getAllDirBuilder();

        getAllFiles({
            search: "",
            is_deleted: false,
            is_paginated: false,
        });
    }, []);

    // Building Directories on the TRIE and Files by inserting 
    // it to FileManager
    useEffect(() => {
        if (buildDirList.buildDir.length !== 0 && resourceList.results.length !== 0) {
            for (let currDir of buildDirList.buildDir) {
                if (currDir !== "/") {
                    fsManager.mkdir(currDir);
                }
            }

            for (let currFile of resourceList.results) {
                if (currFile.full_pathname !== "/") {
                    fsManager.mkfile(currFile.full_pathname + "/" + currFile.filename, currFile.id, currFile.created_at);
                } else {
                    fsManager.mkfile(currFile.full_pathname + currFile.filename, currFile.id, currFile.created_at);
                }
            }

            setMyCurrDir("/");
            setFileDirList([...fsManager.ls("/")]);
        }
    }, [buildDirList, resourceList]);

    useEffect(() => {
        const handleKeyDownCTRL = (event) => {
            if (event.key === "Control") {
                setIsCtrlKeyPressed(true);
            }
        };

        const handleKeyUpCTRL = (event) => {
            if (event.key === "Control") {
                setIsCtrlKeyPressed(false);
            }
        };

        const handleKeyDownSHIFT = (event) => {
            if (event.key === "Shift") {
                setIsShiftKeyPressed(true);
            }
        };

        const handleKeyUpSHIFT = (event) => {
            if (event.key === "Shift") {
                setIsShiftKeyPressed(false);
            }
        };

        window.addEventListener("keydown", handleKeyDownCTRL);
        window.addEventListener("keyup", handleKeyUpCTRL);
        window.addEventListener("keydown", handleKeyDownSHIFT);
        window.addEventListener("keyup", handleKeyUpSHIFT);

        return () => {
            window.removeEventListener("keydown", handleKeyDownCTRL);
            window.removeEventListener("keyup", handleKeyUpCTRL);
            window.removeEventListener("keydown", handleKeyDownSHIFT);
            window.removeEventListener("keyup", handleKeyUpSHIFT);
        };
    }, []);

    // Drag and drop
    const handleFolderDrop = (e, folderTargetName) => {
        e.preventDefault();

        const fullTargetFolderPath = myCurrDir + folderTargetName;
        console.log(selectedItems);

        let fileIDList = [];
        let folderPathList = [];

        for (let currItem of selectedItems) {
            if (typeof currItem !== "string") {
                fileIDList.push(currItem.id);
            } else if (currItem !== folderTargetName) {
                // To make sure that the selected folder don't get moved into itself
                folderPathList.push(myCurrDir + currItem);
            }
        }

        /*
        moveFiles({ id: fileIDList, new_path: fullTargetFolderPath}, () => {
            for (let currItem of selectedItems) {
                if (typeof currItem !== "string") {
                    fsManager.delfile((myCurrDir === "/") ? myCurrDir + currItem.filename : myCurrDir + "/" + currItem.filename, currItem.id);
                    fsManager.mkfile(fullTargetFolderPath, currItem.id);
                }
            }
        });*/

        for (let currFolder of folderPathList) {
            console.log(currFolder);
        }

        setSelectedItems([]);
    };

    const handleItemSelectAgain = (e, item) => {
        e.stopPropagation();

        const currSelect = selectedItems.findIndex(
            (file) => file.id === item.id
        );

        if (
            selectedItems.length > 1 &&
            !isCtrlKeyPressed &&
            !isShiftKeyPressed
        ) {
            setSelectedItems([item]);
        }
    };

    const handleItemSelection = (e, item) => {
        e.stopPropagation();

        let currSelect; 
        
        if (typeof item !== "string") {
            currSelect = selectedItems.findIndex(
                (file) => file.id === item.id
            );
        } else {
            let hasSelect = false;

            for (let i = 0; i < selectedItems.length; i++) {
                if (typeof selectedItems[i] === "string" && item === selectedItems[i]) {
                    currSelect = i;
                    hasSelect = true;
                    break;
                }
            }

            if (!hasSelect) {
                currSelect = -1;
            }
        }
        
        if (!e.shiftKey) {
            let startIndex;

            if (typeof item === "string") {
                for (let i = 0; i < fileDirList.length; i++) {
                    if (typeof fileDirList[i] === "string" && fileDirList[i] === item) {
                        startIndex = i;
                        break;
                    }
                }
            } else {
                startIndex = fileDirList.findIndex(
                    (file) => file.id === item.id
                );
            }

            setShiftStartIndex(startIndex);
        }

        if (currSelect <= -1 || isCtrlKeyPressed || isShiftKeyPressed) {
            if (isCtrlKeyPressed) {
                // CTRL key is pressed
                let itemIndex;
                
                if (typeof item === "string") {
                    for (let i = 0; i < selectedItems.length; i++) {
                        if (typeof selectedItems[i] === "string" && selectedItems[i] === item) {
                            itemIndex = i;
                            break;
                        }
                    }
                } else {
                    itemIndex = selectedItems.findIndex(
                        (selectedItem) => selectedItem.id === item.id
                    );
                }

                if (itemIndex > -1) {
                    // Item already selected, remove it from selectedItems
                    const updatedItems = [...selectedItems];
                    updatedItems.splice(itemIndex, 1);
                    setSelectedItems(updatedItems);
                } else {
                    // Item not selected, add it to selectedItems
                    setSelectedItems([...selectedItems, item]);
                }
            } else if (isShiftKeyPressed) {
                // Shift key is pressed
                const startIndex = shiftStartIndex;

                let endIndex;

                if (typeof item === "string") {
                    for (let i = 0; i < fileDirList.length; i++) {
                        if (typeof fileDirList[i] === "string" && fileDirList[i] === item) {
                            endIndex = i;
                            break;
                        }
                    }
                } else {
                    endIndex = fileDirList.findIndex(
                        (file) => file.id === item.id
                    );
                }
                
                const range = fileDirList.slice(
                    Math.min(startIndex, endIndex),
                    Math.max(startIndex, endIndex) + 1
                );

                setSelectedItems(range);
            } else {
                // CTRL and Shift keys are not pressed, treat as single selection
                let itemIndex;

                if (typeof item === "string") {
                    let hasSelect = false;

                    for (let i = 0; i < selectedItems.length; i++) {
                        if (typeof selectedItems[i] === "string" && selectedItems[i] === item) {
                            itemIndex = i;
                            hasSelect = true;
                            break;
                        }
                    }

                    if (!hasSelect) {
                        itemIndex = -1;
                    }
                } else {
                    itemIndex = selectedItems.findIndex(
                        (selectedItem) => selectedItem.id === item.id
                    );
                }
                
                if (itemIndex > -1) {
                    setSelectedItems([]);
                } else {
                    // Item not selected, add it to selectedItems
                    setSelectedItems([item]);
                }
            }
        }
    };

    const handleSort = sortTableColumn(sortField, setSortDirection, sortDirection, setSortField);

    sortSMCOList(fileDirList, sortField, sortDirection, false);

    const handleSearchChange = (event) => {
        setSearchText(event.target.value);
    };

    const handleSearch = () => {
        setSearchTextPerm(searchText);
    };

    const handleGoToDir = (e, goToFolder) => {
        setPoppedDir(dequeDir.getDirectoryString());
        dequeDir.addRear(goToFolder);
        const newTargetDir = dequeDir.getDirectoryString();
        setMyCurrDir(newTargetDir);
        setFileDirList([...fsManager.ls(newTargetDir)]);
    };

    const handlePopBackToDir = () => {
        dequeDir.removeRear();
        const newTargetDir = dequeDir.getDirectoryString();
        setMyCurrDir(newTargetDir);
        setFileDirList([...fsManager.ls(newTargetDir)]);

        const lastIndex = newTargetDir.lastIndexOf("/");
        let resultPopped;

        if (lastIndex > 0) {
            resultPopped = newTargetDir.substring(0, lastIndex);
        } else if (lastIndex === 0 && dequeDir.getSize() >= 1) {
            resultPopped = "/"
        } else {
            resultPopped = "";
        }

        setPoppedDir(resultPopped);
    }

    function FileOrFolderIcon({ isFile }) {
        return (
            <span>
                {isFile ? <TextSnippetIcon /> : <FolderIcon />}
            </span>
        );
    }

    return (
        <div>
            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by Filename"
                    value={searchText}
                    onChange={handleSearchChange}
                />

                <AiOutlineSearch
                    onClick={handleSearch}
                    className="search-icon"
                />
            </div>

            <br />

            <span>PWD: {myCurrDir}</span>

            <br />
            <br />

            <div>
                <MUIButton
                    style={{
                        border: "2px solid #555",
                        margin: "2px",
                        borderRadius: "4px",
                        padding: "8px",
                        boxSizing: "border-box"
                    }}
                    disabled={
                        poppedDir === ""
                    }
                    onClick={handlePopBackToDir}
                >
                    Go Back To: {poppedDir}
                </MUIButton>
            </div>

            <StyledTable>
                <thead>
                    <StyledHeaderRow>
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
                    </StyledHeaderRow>
                </thead>
                {
                    <tbody>
                        {fileDirList.map((fileDir) => (
                            <StyledRow
                                key={typeof fileDir === "string" ? (fileDir) : fileDir.id}
                                className={`item ${selectedItems.includes(fileDir)
                                    ? "selected"
                                    : ""
                                    }`}
                                onMouseDown={(e) =>
                                    handleItemSelection(e, fileDir)
                                }
                                onMouseUp={(e) => {
                                    handleItemSelectAgain(e, fileDir);
                                }}
                                onDoubleClick={(e) => {
                                    if (typeof fileDir === "string") {
                                        handleGoToDir(e, fileDir);
                                    }
                                }}
                                draggable
                                onDrop={(e) => {
                                    if (typeof fileDir === "string") {
                                        handleFolderDrop(e, fileDir);
                                    }
                                }}
                                onDragOver={(e) => {
                                    if (typeof fileDir === "string") {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                <StyledCell>
                                    <FileOrFolderIcon isFile={typeof fileDir !== "string"} />
                                    {(typeof fileDir === "string") ? (" " + fileDir) : (" " + fileDir.filename)}
                                </StyledCell>

                                <StyledCell>
                                    {(typeof fileDir === "string") 
                                        ? ("Folder") 
                                        : moment(fileDir.created_at).format("hh:mm A DD-MMM-YYYY")}
                                </StyledCell>
                            </StyledRow>
                        ))}
                    </tbody>
                }
            </StyledTable>

            <br/>
        </div>
    );
};

export default FileExplorer;
