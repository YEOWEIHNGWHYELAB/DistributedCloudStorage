import React from "react";

const DeleteConfirmationDialog = ({ item, isVisible, onCancel, onConfirm }) => {
    if (!isVisible) 
        return null;

    return (
        <div className="dialog">
            <p>Are you sure you want to delete {item}?</p>
            <button onClick={onCancel}>Cancel</button>
            <button onClick={onConfirm}>Delete</button>
        </div>
    );
};

export default DeleteConfirmationDialog;
