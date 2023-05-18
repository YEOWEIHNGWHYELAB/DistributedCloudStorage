import {
    Button as MUIButton,
    Dialog,
    DialogActions,
    DialogTitle,
} from "@mui/material";

export function multiSelectDeleteUploadButtons(
    handleFileSelect,
    selectedElements,
    handleMulDownload,
    setOpendeleteMulDialog,
    selectedFiles,
    handleFileUpload,
    handleFileUploadCancel,
    isDraggingOver
) {
    return (
        <div>
            <input
                style={{
                    display: "none",
                }}
                id="file-upload"
                multiple
                type="file"
                onChange={handleFileSelect}
            />
            <label htmlFor="file-upload">
                <MUIButton
                    variant="contained"
                    component="span"
                    style={{
                        border: "2px solid #0000ff",
                        margin: "2px",
                        borderRadius: "4px",
                        padding: "8px",
                        width: "25%",
                        boxSizing: "border-box",
                        color: "green",
                        background: "transparent",
                    }}
                >
                    SELECT FILES FOR UPLOAD
                </MUIButton>
            </label>

            <MUIButton
                style={{
                    border: "2px solid #00ff00",
                    margin: "2px",
                    borderRadius: "4px",
                    padding: "8px",
                    width: "25%",
                    boxSizing: "border-box",
                }}
                onClick={() => {
                    if (selectedElements.length !== 0) {
                        handleMulDownload();
                    }
                }}
            >
                DOWNLOAD SELECTED FILES
            </MUIButton>

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
                        setOpendeleteMulDialog(true);
                    }
                }}
            >
                DELETE SELECTED FILE
            </MUIButton>

            {selectedFiles.length > 0 && (
                <div>
                    <p>Selected files to upload:</p>
                    <ul>
                        {selectedFiles.map((file, index) => (
                            <li key={index}>{file.name}</li>
                        ))}
                    </ul>

                    <MUIButton
                        style={{
                            border: "2px solid grey",
                            margin: "2px",
                            borderRadius: "4px",
                            padding: "8px",
                            width: "15%",
                            boxSizing: "border-box",
                        }}
                        onClick={handleFileUpload}
                    >
                        UPLOAD FILES
                    </MUIButton>

                    <MUIButton
                        style={{
                            border: "2px solid grey",
                            margin: "2px",
                            borderRadius: "4px",
                            padding: "8px",
                            width: "15%",
                            boxSizing: "border-box",
                        }}
                        onClick={handleFileUploadCancel}
                    >
                        CANCEL
                    </MUIButton>
                </div>
            )}

            {isDraggingOver && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        border: "2px solid #ff0000",
                        zIndex: 9999,
                    }}
                ></div>
            )}
        </div>
    );
}

export function deleteSelectedCredentialsButton(
    selectedElements,
    handleOpenMultiDeleteDialog
) {
    return (
        <MUIButton
            onClick={() => {
                if (selectedElements.length !== 0) {
                    handleOpenMultiDeleteDialog();
                }
            }}
            style={{
                border: "2px solid #ff0000",
                margin: "2px",
                borderRadius: "4px",
                padding: "8px",
                width: "30%",
                boxSizing: "border-box",
            }}
        >
            Delete Selected Credentials
        </MUIButton>
    );
}

export function addNewCredentialButton(handleOpen) {
    return (
        <MUIButton
            onClick={handleOpen}
            style={{
                border: "2px solid #ff7bff",
                margin: "2px",
                borderRadius: "4px",
                padding: "8px",
                width: "20%",
                boxSizing: "border-box",
            }}
        >
            ADD NEW CREDENTIAL
        </MUIButton>
    );
}

export function selectAllHandler(selectAll, setSelectedElements, resourceList, setSelectAll) {
    return () => {
        if (selectAll) {
            setSelectedElements([]);
        } else {
            const allIds = resourceList.results.map((row) => row.id);
            setSelectedElements(allIds);
        }

        setSelectAll(!selectAll);
    };
}

export function selectAllItemCheckbox(StyledCell, setSelectedElements, files, selectedElements) {
    return <StyledCell>
        <input
            type="checkbox"
            className="selection-checkbox"
            onChange={(event) => {
                const isChecked = event.target.checked;

                setSelectedElements(
                    (prevSelectedElements) => {
                        if (isChecked) {
                            return [
                                ...prevSelectedElements,
                                files.id,
                            ];
                        } else {
                            return prevSelectedElements.filter(
                                (id) => id !== files.id
                            );
                        }
                    }
                );
            } }
            checked={selectedElements.includes(
                files.id
            )} />
    </StyledCell>;
}
