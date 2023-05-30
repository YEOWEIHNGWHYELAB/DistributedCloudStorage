import React, { useState } from "react";

const FileExplorer = () => {
    const [files, setFiles] = useState([
        { name: "file1.txt", type: "file" },
        { name: "file2.jpg", type: "file" },
        {
            name: "directory1",
            type: "directory",
            files: [
                { name: "file3.png", type: "file" },
                {
                    name: "directory2",
                    type: "directory",
                    files: [
                        { name: "file4.docx", type: "file" },
                        { name: "file5.pdf", type: "file" },
                    ],
                },
            ],
        },
    ]);

    const handleDrop = (event, targetDirectory) => {
        event.preventDefault();
        const droppedFiles = JSON.parse(event.dataTransfer.getData("text"));

        // Add the dropped files to the target directory
        const updatedFiles = files.map((file) => {
            if (file === targetDirectory) {
                if (file.type === "directory") {
                    return {
                        ...file,
                        files: [...file.files, ...droppedFiles],
                    };
                }
            }
            return file;
        });

        setFiles(updatedFiles);
    };

    const handleDragStart = (event, draggedFile) => {
        event.dataTransfer.setData("text", JSON.stringify([draggedFile]));
    };

    const renderFile = (file) => {
        if (file.type === "file") {
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
        } else if (file.type === "directory") {
            return (
                <div
                    key={file.name}
                    className="directory"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDrop(event, file)}
                >
                    <strong>{file.name}</strong>
                    {file.files.map(renderFile)}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="file-explorer">
            <h2>File Explorer</h2>
            <div className="file-tree">{files.map(renderFile)}</div>
        </div>
    );
};

export default FileExplorer;
