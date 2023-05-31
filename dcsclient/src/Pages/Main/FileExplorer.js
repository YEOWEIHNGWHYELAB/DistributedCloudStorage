import React, { useState, useEffect } from "react";
import "./FileExplorerStyle.css";

const FileExplorer = () => {
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

    const [selectedItemDragDrop, setSeletedItemDragDrop] = useState(null);

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

    const handleFileDragStart = (e, file) => {
        setSeletedItemDragDrop(file);
    };

    const handleFolderDrop = (e, folderId) => {
        e.preventDefault();

        const folder = files.find((f) => f.id === folderId);

        let droppedFiles = [];

        if (selectedItems.length != 0) {
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
            droppedFiles.push(selectedItemDragDrop);
            folder.items.push(...droppedFiles);
        }

        console.log(folder);

        setSelectedItems([...selectedItems, ...droppedFiles]);

        setSeletedItemDragDrop(null);
    };

    const handleItemSelection = (e, item) => {
        e.stopPropagation();

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
            const isSelected = selectedItems.includes(item);

            if (isSelected) {
                // Item already selected, remove it from selectedItems
                const updatedItems = selectedItems.filter(
                    (selectedItem) => selectedItem.id !== item.id
                );
                setSelectedItems(updatedItems);
            } else {
                // Item not selected, add it to selectedItems
                setSelectedItems([item]);
            }
        }
    };

    const handleItemMouseDown = (e, item) => {
        e.stopPropagation();

        if (!e.shiftKey) {
            const startIndex = files.findIndex((file) => file.id === item.id);
            setShiftStartIndex(startIndex);
        }
    };

    return (
        <div>
            <table className="file-explorer">
                <tbody>
                    {files.map((file, index) => (
                        <tr
                            key={file.id}
                            className={`item ${
                                selectedItems.includes(file) ? "selected" : ""
                            }`}
                            draggable
                            onDragStart={(e) => handleFileDragStart(e, file)}
                            onClick={(e) => handleItemSelection(e, file)}
                            onMouseDown={(e) => handleItemMouseDown(e, file)}
                            onDrop={(e) => handleFolderDrop(e, file.id)}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <td>{file.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FileExplorer;
