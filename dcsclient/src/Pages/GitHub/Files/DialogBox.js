import {
    Button as MUIButton,
    Dialog,
    DialogActions,
    DialogTitle,
} from "@mui/material";


export function deleteDialogPrompt(deleteDialog, handleDeleteCloseDialog, handleDeleteID, dialogPrompt) {
    return (
        <Dialog open={deleteDialog} onClose={handleDeleteCloseDialog}>
            <DialogTitle>
                {dialogPrompt}
            </DialogTitle>

            <DialogActions>
                <MUIButton onClick={handleDeleteID}>YES!</MUIButton>
                <MUIButton onClick={handleDeleteCloseDialog}>NO!</MUIButton>
            </DialogActions>
        </Dialog>
    );
}
