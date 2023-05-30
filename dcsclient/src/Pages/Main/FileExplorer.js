import React, { useState, useEffect } from 'react';
import "./FileExplorerStyle.css";

const FileExplorer = () => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [folders, setFolders] = useState([
        { id: 1, name: 'Folder 1', isFolder: true, items: [] },
        { id: 2, name: 'Folder 2', isFolder: true, items: [] },
    ]);
    const [files, setFiles] = useState([
        { id: 1, name: 'File 1.txt', isFolder: false },
        { id: 2, name: 'File 2.png', isFolder: false },
        { id: 3, name: 'File 3.png', isFolder: false },
        { id: 4, name: 'File 5.png', isFolder: false },
        { id: 5, name: 'File 4.png', isFolder: false },
    ]);
    const [isCtrlKeyPressed, setIsCtrlKeyPressed] = useState(false);
    const [shiftStartIndex, setShiftStartIndex] = useState(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Control') {
                setIsCtrlKeyPressed(true);
            }
        };

        const handleKeyUp = (event) => {
            if (event.key === 'Control') {
                setIsCtrlKeyPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleFolderDrop = (e, folderId) => {
        e.preventDefault();
        const folder = folders.find((f) => f.id === folderId);

        const fileIds = e.dataTransfer.getData('text/plain').split(',');
        const droppedFiles = files.filter((file) => fileIds.includes(file.id.toString()));

        folder.items.push(...droppedFiles);
        setFolders([...folders]);
        setSelectedItems([...selectedItems, ...droppedFiles]);
    };

    const handleFileDragStart = (e, fileId) => {
        e.dataTransfer.setData('text/plain', fileId.toString());
    };

    const handleItemSelection = (e, item) => {
        e.stopPropagation();

        if (isCtrlKeyPressed) {
            // CTRL key is pressed
            const itemIndex = selectedItems.findIndex((selectedItem) => selectedItem.id === item.id);

            if (itemIndex > -1) {
                // Item already selected, remove it from selectedItems
                const updatedItems = [...selectedItems];
                updatedItems.splice(itemIndex, 1);
                setSelectedItems(updatedItems);
            } else {
                // Item not selected, add it to selectedItems
                setSelectedItems([...selectedItems, item]);
            }
        } else if (shiftStartIndex !== null) {
            // Shift key is pressed
            const startIndex = shiftStartIndex;
            const endIndex = files.findIndex((file) => file.id === item.id);
            const range = files.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);

            setSelectedItems(range);
        } else {
            // CTRL and Shift keys are not pressed, treat as single selection
            const isSelected = selectedItems.includes(item);

            if (isSelected) {
                // Item already selected, remove it from selectedItems
                const updatedItems = selectedItems.filter((selectedItem) => selectedItem.id !== item.id);
                setSelectedItems(updatedItems);
            } else {
                // Item not selected, add it to selectedItems
                setSelectedItems([...selectedItems, item]);
            }
        }
    };

    const handleItemMouseDown = (e, item) => {
        e.stopPropagation();

        if (e.shiftKey) {
            // Shift key is pressed
            const startIndex = files.findIndex((file) => file.id === item.id);

            setShiftStartIndex(startIndex);
        }
    };

    const handleItemMouseUp = (e) => {
        e.stopPropagation();
        setShiftStartIndex(null);
    };

    return (
        <div>
            <div className="file-explorer">
                <div className="folders">
                    <h3>Folders</h3>
                    {folders.map((folder) => (
                        <div
                            key={folder.id}
                            className="folder"
                            onDrop={(e) => handleFolderDrop(e, folder.id)}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            {folder.name}
                            {folder.items.map((item) => (
                                <div
                                    key={item.id}
                                    className={`item ${selectedItems.includes(item) ? 'selected' : ''}`}
                                    onClick={(e) => handleItemSelection(e, item)}
                                    onMouseDown={(e) => handleItemMouseDown(e, item)}
                                    onMouseUp={handleItemMouseUp}
                                >
                                    {item.name}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="files">
                    <h3>Files</h3>
                    {files.map((file, index) => (
                        <div
                            key={file.id}
                            className={`item ${selectedItems.includes(file) ? 'selected' : ''}`}
                            draggable
                            onDragStart={(e) => handleFileDragStart(e, file.id)}
                            onClick={(e) => handleItemSelection(e, file)}
                            onMouseDown={(e) => handleItemMouseDown(e, file)}
                            onMouseUp={handleItemMouseUp}
                        >
                            {file.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FileExplorer;
