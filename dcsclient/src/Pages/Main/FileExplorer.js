import React, { useState } from 'react';

const FileExplorer = () => {
    const initialFiles = [
        { name: 'file1.txt', type: 'file' },
        { name: 'file2.jpg', type: 'file' },
        {
            name: 'directory1', type: 'directory', files: [
                { name: 'file3.png', type: 'file' },
                {
                    name: 'directory2', type: 'directory', files: [
                        { name: 'file4.docx', type: 'file' },
                        { name: 'file5.pdf', type: 'file' },
                    ]
                }
            ]
        }
    ];

    const [currentDirectory, setCurrentDirectory] = useState(initialFiles);
    const [path, setPath] = useState([]);

    const handleDrop = (event, targetDirectory) => {
        event.preventDefault();
        const droppedFiles = JSON.parse(event.dataTransfer.getData('text'));

        // Move the dropped files to the target directory
        const updatedFiles = currentDirectory.map(file => {
            if (file === targetDirectory) {
                if (file.type === 'directory') {
                    return {
                        ...file,
                        files: [...file.files, ...droppedFiles]
                    };
                }
            } else if (file.type === 'directory' && file.files.includes(targetDirectory)) {
                return {
                    ...file,
                    files: file.files.filter(f => !droppedFiles.includes(f))
                };
            }
            return file;
        });

        setCurrentDirectory(updatedFiles);
    };

    const handleDragStart = (event, draggedFile) => {
        event.dataTransfer.setData('text', JSON.stringify([draggedFile]));
    };

    const handleClick = (directory) => {
        if (directory.type === 'directory') {
            setCurrentDirectory(directory.files);
            setPath([...path, directory]);
        }
    };

    const handleGoBack = () => {
        if (path.length > 0) {
            const newPath = path.slice(0, path.length - 1);
            const prevDirectory = newPath[newPath.length - 1];
            setCurrentDirectory(prevDirectory.files);
            setPath(newPath);
        }
    };

    const renderFile = (file) => {
        if (file.type === 'file') {
            return (
                <div
                    key={file.name}
                    className="file"
                    draggable
                    onDragStart={(event) => handleDragStart(event, file)}
                >
                    {file.name}
                </div>
            );
        } else if (file.type === 'directory') {
            return (
                <div
                    key={file.name}
                    className="directory"
                    onClick={() => handleClick(file)}
                    onDragOver={(event) => event.preventDefault()} // Allow dropping onto the directory
                    onDrop={(event) => handleDrop(event, file)}
                >
                    <strong>{file.name}</strong>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="file-explorer">
            <h2>File Explorer</h2>
            <div className="file-path">
                <button onClick={handleGoBack} disabled={path.length === 0}>
                    Go Back
                </button>
                {path.map((directory, index) => (
                    <span key={index}>{directory.name} / </span>
                ))}
            </div>
            <div className="file-tree">
                {currentDirectory.map(renderFile)}
            </div>
        </div>
    );
};

export default FileExplorer;
