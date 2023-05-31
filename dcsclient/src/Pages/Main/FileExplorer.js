import React, { useState, useEffect } from "react";

import { fileTableStyle } from "../../Windows/TableStyle";
import "./FileExplorerStyle.css";

const FileExplorer = () => {
    const {
        StyledTable,
        StyledHeaderRow,
        StyledHeaderCell,
        StyledRow,
        StyledCell,
    } = fileTableStyle();

    const [files, setFiles] = useState([
        { id: 0, name: "File 1.txt", isFolder: false },
        { id: 1, name: "File 2.png", isFolder: false },
        { id: 2, name: "File 3.png", isFolder: false },
        { id: 3, name: "File 5.png", isFolder: false },
        { id: 4, name: "File 4.png", isFolder: false },
        { id: 5, name: "Folder 2", isFolder: true, items: [] },
        { id: 6, name: "Folder 1", isFolder: true, items: [] },
    ]);

    const [selectedItems, setSelectedItems] = useState([]);

    const [isCtrlKeyPressed, setIsCtrlKeyPressed] = useState(false);
    const [isShiftKeyPressed, setIsShiftKeyPressed] = useState(false);

    const [shiftStartIndex, setShiftStartIndex] = useState(0);

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

        const folder = files.find((f) => f.id === folderId);

        let droppedFiles = [];

        if (selectedItems.length > 1) {
            let itemHS = new Set();

            for (let itemSelected of selectedItems) {
                if (!itemHS.has(itemSelected.id)) {
                    itemHS.add(itemSelected.id);
                }
            }

            for (let itemLs of files) {
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

    const handleItemSelection = (e, item) => {
        e.stopPropagation();

        if (!e.shiftKey) {
            const startIndex = files.findIndex((file) => file.id === item.id);
            setShiftStartIndex(startIndex);
        }

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
            const endIndex = files.findIndex((file) => file.id === item.id);
            const range = files.slice(
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
    };

    return (
        <div>
            <StyledTable>
                <thead>
                    <StyledHeaderRow>
                        <StyledHeaderCell>Filename</StyledHeaderCell>
                    </StyledHeaderRow>
                </thead>
                {
                    <tbody>
                        {files.map((file, index) => (
                            <StyledRow
                                key={file.id}
                                className={`item ${selectedItems.includes(file) ? 'selected' : ""}`}
                                draggable
                                onClick={(e) => handleItemSelection(e, file)}
                                onDrop={(e) => {
                                    if (file.isFolder) {
                                        handleFolderDrop(e, file.id);
                                    }
                                }}
                                onDragOver={(e) => {
                                    if (file.isFolder) {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                <StyledCell>{file.name}</StyledCell>
                            </StyledRow>
                        ))}
                    </tbody>
                }
            </StyledTable>
        </div>
    );
};

export default FileExplorer;
