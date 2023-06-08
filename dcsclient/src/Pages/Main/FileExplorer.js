import React, { useState, useEffect } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import moment from "moment";
import {
    Button as MUIButton
} from "@mui/material";
import FolderIcon from '@mui/icons-material/Folder';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import * as Yup from "yup";

import DirectoryDeque from "./DirectoryDeque";
import RequestSMCO from "../../Hooks/RequestSMCO";
import RequestResource from "../../Hooks/RequestResource";

import { fileTableStyle } from "../../Windows/TableStyle";
import { renameDialog } from "../../Windows/DialogBox";
import { sortSMCOList, sortTableColumn } from "../../Windows/TableControl";
import rightClickMenu from "./ContextMenu";
import "./FileExplorerStyle.css";
import "./ContextMenuStyle.css";

const ContextMenu = ({ position, onClose, numFile, renameHandler, moveHandler, deleteHandler }) => {
    const handleRenameClick = () => {
        renameHandler();
        onClose();
    };

    const handleMoveToClick = () => {
        moveHandler();
        onClose();
    };

    const handleDeleteToClick = () => {
        deleteHandler();
        onClose();
    };

    return (
        rightClickMenu(position, numFile, handleRenameClick, handleMoveToClick, handleDeleteToClick)
    );
};

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
        moveFiles,
        moveFolder,
        renameFile,
        renameFolder,
        deleteFolder,
        deleteMulFiles
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

    const [searchText, setSearchText] = useState("");

    const [selectedItems, setSelectedItems] = useState([]);

    const [isCtrlKeyPressed, setIsCtrlKeyPressed] = useState(false);
    const [isShiftKeyPressed, setIsShiftKeyPressed] = useState(false);

    const [shiftStartIndex, setShiftStartIndex] = useState(0);

    // Context Menu handler
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

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
        if (buildDirList.dirLoad && resourceList.resLoad) {
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

        window.addEventListener('contextmenu', handleGlobalContextMenu);
        document.addEventListener('click', handleDocumentClick);

        return () => {
            window.removeEventListener("keydown", handleKeyDownCTRL);
            window.removeEventListener("keyup", handleKeyUpCTRL);
            window.removeEventListener("keydown", handleKeyDownSHIFT);
            window.removeEventListener("keyup", handleKeyUpSHIFT);

            window.removeEventListener('contextmenu', handleGlobalContextMenu);
            document.removeEventListener('click', handleDocumentClick);
        };
    }, []);

    // Handle scrolling while dragging
    const dragThreshold = 250;

    const handleDrag = (event) => {
        const dragY = event.clientY;

        if (dragY < dragThreshold) {
            // Dragging near the top, scroll up
            window.scrollBy({
                top: -10,
                behavior: 'smooth',
            });
        } else if (dragY > window.innerHeight - dragThreshold) {
            // Dragging near the bottom, scroll down
            window.scrollBy({
                top: 10,
                behavior: 'smooth',
            });
        }
    };

    // Drag and drop
    const handleFolderDrop = (e, folderTargetName) => {
        e.preventDefault();

        let fullTargetFolderPath;

        if (myCurrDir !== "/") {
            fullTargetFolderPath = myCurrDir + "/" + folderTargetName;
        } else {
            fullTargetFolderPath = myCurrDir + folderTargetName;
        }

        let fileIDList = [];
        let folderPathList = [];

        for (let currItem of selectedItems) {
            if (typeof currItem !== "string") {
                fileIDList.push(currItem.id);
            } else if (currItem !== folderTargetName) {
                // To make sure that the selected folder don't get moved into itself
                folderPathList.push(currItem);
            }
        }

        moveFiles({ id: fileIDList, new_path: fullTargetFolderPath }, () => {
            for (let currItem of selectedItems) {
                if (typeof currItem !== "string") {
                    fsManager.delfile((myCurrDir === "/") ? myCurrDir + currItem.filename : myCurrDir + "/" + currItem.filename, currItem.id);
                    fsManager.mkfile((fullTargetFolderPath === "/") ? fullTargetFolderPath + currItem.filename : fullTargetFolderPath + "/" + currItem.filename, currItem.id);
                }

                if (folderPathList.length == 0) {
                    const fileIDSet = new Set(fileIDList);
                    setFileDirList(fileDirList.filter(fileDir => (typeof fileDir === "string") || !fileIDSet.has(fileDir.id)));
                }
            }

            let countFolderCount = 0;

            for (let currFolder of folderPathList) {
                countFolderCount++;

                let oldDir = (myCurrDir === "/") ? myCurrDir + currFolder : myCurrDir + "/" + currFolder;

                moveFolder({
                    old_path: oldDir,
                    new_path: fullTargetFolderPath
                }, () => {
                    fsManager.mvdir(oldDir, fullTargetFolderPath);
                    fsManager.deldir(oldDir);

                    if (countFolderCount === folderPathList.length) {
                        const folderNameSet = new Set(folderPathList);
                        const fileIDSet = new Set(fileIDList);

                        let newList = [];

                        for (let currFileDir of fileDirList) {
                            if (typeof currFileDir !== "string") {
                                if (!fileIDSet.has(currFileDir.id)) {
                                    newList.push(currFileDir);
                                }
                            } else {
                                if (!folderNameSet.has(currFileDir)) {
                                    newList.push(currFileDir);
                                }
                            }
                        }

                        setFileDirList(newList);
                    }
                });
            }
        });

        // Remove all the selected item...
        setSelectedItems([]);
    };

    const handleItemSelectAgain = (e, item) => {
        e.stopPropagation();

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
        if (searchText !== "") {
            setFileDirList([...fsManager.search(searchText)]);
        } else {
            setFileDirList([...fsManager.ls(myCurrDir)]);
        }
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

    const handleContextMenu = (event) => {
        event.preventDefault();

        const { clientX, clientY } = event;
        setShowContextMenu(true);
        setContextMenuPosition({ x: clientX, y: clientY });
    };

    const handleDocumentClick = () => {
        setShowContextMenu(false);
    };

    // To prevent the original right click menu from popping up
    const handleGlobalContextMenu = (event) => {
        event.preventDefault();
    };

    // File renaming
    const FileNamevalidationSchema = Yup.object().shape({
        new_filename: Yup.string().required("Name is required!"),
    });
    const [idEdit, setIDEdit] = useState(null);
    const [originalFileFolderName, setOriginalFileFolderName] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const handleEditClose = () => {
        setOpenEditDialog(false);
        setIDEdit(null);
        setOriginalFileFolderName(null);
        setSelectedItems([]);
    };
    const handleRenameSubmit = (values) => {
        if (idEdit !== "fd_") {
            values["id"] = selectedItems[0].id;
            renameFile(values, () => {
                let oldFileDir = (myCurrDir === "/") ? myCurrDir + originalFileFolderName : myCurrDir + "/" + originalFileFolderName;
                fsManager.renamefile(oldFileDir, selectedItems[0].id, values.new_filename);
                setFileDirList([...fsManager.ls(myCurrDir)]);
                console.log(fsManager.ls(myCurrDir));
            });
        } else {
            let folderFoundIDX = fileDirList.findIndex((item) => (typeof item === "string" && item === values.new_filename));

            if (folderFoundIDX >= 0) {
                alert("Folder name already exist!");
            } else {
                let oldDir = (myCurrDir === "/") ? myCurrDir + originalFileFolderName : myCurrDir + "/" + originalFileFolderName;
                const newFolderValue = { path_rename: oldDir, new_pathname: values.new_filename }
                renameFolder(newFolderValue, () => {
                    fsManager.renamedir(oldDir, values.new_filename);
                    setFileDirList([...fsManager.ls(myCurrDir)]);
                });
            }
        }

        handleEditClose();
    };

    return (
        <div>
            {renameDialog(
                openEditDialog,
                handleEditClose,
                originalFileFolderName,
                idEdit,
                handleRenameSubmit,
                FileNamevalidationSchema
            )}

            {showContextMenu && (
                <ContextMenu
                    onClose={() => setShowContextMenu(false)}
                    position={{
                        x: contextMenuPosition.x + window.pageXOffset - (window.innerWidth >= 900 ? 300 : 0),
                        y: contextMenuPosition.y + window.pageYOffset,
                    }}
                    numFile={{ numFile: selectedItems.length }}
                    renameHandler={() => {
                        let fileFolderName;

                        if (typeof selectedItems[0] === "string") {
                            fileFolderName = selectedItems[0].toString();
                            setIDEdit("fd_");
                        } else {
                            fileFolderName = selectedItems[0].filename;
                            setIDEdit(selectedItems[0].id);
                        }

                        setOriginalFileFolderName(fileFolderName);

                        setOpenEditDialog(true);
                    }}
                    moveHandler={{}}
                    deleteHandler={() => {
                        let ghIDArr = [];
                        let ghFileName = [];
                        let ytIDArr = [];
                        let ytFileName = [];
                        let folderNameArr = [];

                        for (let selectedItem of selectedItems) {
                            if (typeof selectedItem === "string") {
                                if (myCurrDir === "/") {
                                    folderNameArr.push(myCurrDir + selectedItem)
                                } else {
                                    folderNameArr.push(myCurrDir + "/" + selectedItem);
                                }
                            } else {
                                let firstUnderscoreIndex = selectedItem.id.indexOf("_");
                                let platform = selectedItem.id.slice(0, firstUnderscoreIndex);
                                let fileID = selectedItem.id.slice(firstUnderscoreIndex + 1);

                                if (platform === "gh") {
                                    ghIDArr.push(fileID);
                                    ghFileName.push(selectedItem.filename);
                                } else if (platform === "yt") {
                                    ytIDArr.push(fileID);
                                    ytFileName.push(selectedItem.filename);
                                }
                            }
                        }
 
                        deleteMulFiles(ghIDArr, true, "github/files/muldel", () => {
                            for (let ghIDX = 0; ghIDX < ghIDArr.length; ghIDX++) {
                                if (myCurrDir === "/") {
                                    fsManager.delfile(myCurrDir + ghFileName[ghIDX], "gh_" + ghIDArr[ghIDX].toString());
                                } else {
                                    fsManager.delfile(myCurrDir + "/" + ghFileName[ghIDX], "gh_" + ghIDArr[ghIDX].toString());
                                }
                            }

                            deleteMulFiles(ytIDArr, true, "google/youtube/videos/muldel", () => {
                                for (let ytIDX = 0; ytIDX < ytIDArr.length; ytIDX++) {
                                    if (myCurrDir === "/") {
                                        fsManager.delfile(myCurrDir + ytFileName[ytIDX], "yt_" + ytIDArr[ytIDX]);
                                    } else {
                                        fsManager.delfile(myCurrDir + "/" + ytFileName[ytIDX], "yt_" + ytIDArr[ytIDX]);
                                    }
                                }
                                
                                if (folderNameArr.length === 0) {
                                    setFileDirList([...fsManager.ls(myCurrDir)]);
                                }

                                for (let folderIDXCurr = 0; folderIDXCurr < folderNameArr.length; folderIDXCurr++) {
                                    deleteFolder({ directory_name: folderNameArr[folderIDXCurr] }, () => {
                                        fsManager.deldir(folderNameArr[folderIDXCurr]);

                                        if (folderIDXCurr == folderNameArr.length - 1) {
                                            setFileDirList([...fsManager.ls(myCurrDir)]);
                                        }
                                    });
                                }
                            });
                        });
                    }}
                />
            )}

            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Global Search by Filename"
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
                                onMouseDown={(e) => {
                                    if (e.button === 0) {
                                        handleDocumentClick();
                                        handleItemSelection(e, fileDir);
                                    } else if (e.button === 2) {
                                        let currIDX = selectedItems.findIndex(
                                            (selectedItem) => (typeof fileDir !== "string")
                                                ? selectedItem.id === fileDir.id
                                                : selectedItem === fileDir
                                        );

                                        if (currIDX < 0) {
                                            handleDocumentClick();
                                            handleItemSelection(e, fileDir);
                                        }
                                    }
                                }}
                                onMouseUp={(e) => {
                                    if (e.button === 0) {
                                        handleItemSelectAgain(e, fileDir);
                                    }
                                }}
                                onDoubleClick={(e) => {
                                    if (typeof fileDir === "string") {
                                        handleGoToDir(e, fileDir);
                                    }
                                }}
                                draggable
                                onDrag={handleDrag}
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
                                onContextMenu={handleContextMenu}
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

            <br />
        </div>
    );
};

export default FileExplorer;
