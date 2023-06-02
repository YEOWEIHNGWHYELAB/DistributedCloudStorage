import React, { useState, useEffect } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import FolderIcon from '@mui/icons-material/Folder';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';

import DirectoryDeque from "./DirectoryDeque";
import RequestSMCO from "../../Hooks/RequestSMCO";

import { fileTableStyle } from "../../Windows/TableStyle";
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
        getAllFiles
    } = RequestSMCO({ resourceLabel: "Files" });

    // Directory navigation management
    const [dequeDir] = useState(() => new DirectoryDeque());

    // Current directory manager
    const [fileDirList, setFileDirList] = useState([]);

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

    const handleFolderDrop = (e, folderId) => {
        e.preventDefault();

        const folder = fileDirList.find((f) => f.id === folderId);

        let droppedFiles = [];

        if (selectedItems.length > 1) {
            let itemHS = new Set();

            for (let itemSelected of selectedItems) {
                if (!itemHS.has(itemSelected.id)) {
                    itemHS.add(itemSelected.id);
                }
            }

            for (let itemLs of fileDirList) {
                if (itemHS.has(itemLs.id)) {
                    droppedFiles.push(itemLs);
                }
            }

            folder.items.push(...droppedFiles);
        } else {
            droppedFiles.push(...selectedItems);
            folder.items.push(...droppedFiles);
        }

        console.log(folder);

        setSelectedItems([...selectedItems, ...droppedFiles]);
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

        const currSelect = selectedItems.findIndex(
            (file) => file.id === item.id
        );

        if (!e.shiftKey) {
            const startIndex = fileDirList.findIndex(
                (file) => file.id === item.id
            );
            setShiftStartIndex(startIndex);
        }

        if (currSelect <= -1 || isCtrlKeyPressed || isShiftKeyPressed) {
            if (isCtrlKeyPressed) {
                // CTRL key is pressed
                const itemIndex = selectedItems.findIndex(
                    (selectedItem) => selectedItem.id === item.id
                );

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
                const endIndex = fileDirList.findIndex(
                    (file) => file.id === item.id
                );
                const range = fileDirList.slice(
                    Math.min(startIndex, endIndex),
                    Math.max(startIndex, endIndex) + 1
                );

                setSelectedItems(range);
            } else {
                // CTRL and Shift keys are not pressed, treat as single selection
                const itemIndex = selectedItems.findIndex(
                    (selectedItem) => selectedItem.id === item.id
                );

                if (itemIndex > -1) {
                    setSelectedItems([]);
                } else {
                    // Item not selected, add it to selectedItems
                    setSelectedItems([item]);
                }
            }
        }
    };

    const handleSearchChange = (event) => {
        setSearchText(event.target.value);
    };

    const handleSearch = () => {
        setSearchTextPerm(searchText);
    };

    const handleGoToDir = (e, goToFolder) => {
        dequeDir.addRear(goToFolder);
        const newTargetDir = dequeDir.getDirectoryString();

        setFileDirList([...fsManager.ls(newTargetDir)]);
    };

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

            <StyledTable>
                <thead>
                    <StyledHeaderRow>
                        <StyledHeaderCell>Filename</StyledHeaderCell>
                        <StyledHeaderCell>Date Created</StyledHeaderCell>
                    </StyledHeaderRow>
                </thead>
                {
                    <tbody>
                        {fileDirList.map((fileDir) => (
                            <StyledRow
                                key={typeof fileDir === "string" ? (fileDir) : fileDir.id }
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
                                    if (fileDir.isFolder) {
                                        handleFolderDrop(e, fileDir.id);
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
                                    {(typeof fileDir === "string") ? ("Folder") : fileDir.created_at}
                                </StyledCell>
                            </StyledRow>
                        ))}
                    </tbody>
                }
            </StyledTable>
        </div>
    );
};

export default FileExplorer;
