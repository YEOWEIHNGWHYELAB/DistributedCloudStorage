import {
    Button as MUIButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from "@mui/material";
import { Formik, Form, Field } from "formik";

export function deleteDialogPrompt(
    deleteDialog,
    handleDeleteCloseDialog,
    handleDeleteID,
    dialogPrompt
) {
    return (
        <Dialog open={deleteDialog} onClose={handleDeleteCloseDialog}>
            <DialogTitle>{dialogPrompt}</DialogTitle>

            <DialogActions>
                <MUIButton onClick={handleDeleteID}>YES!</MUIButton>
                <MUIButton onClick={handleDeleteCloseDialog}>NO!</MUIButton>
            </DialogActions>
        </Dialog>
    );
}

export function renameDialog(
    openEditDialog,
    handleEditClose,
    originalFileName,
    idEdit,
    handleUpdateFileSubmit,
    FileNamevalidationSchema
) {
    return (
        <Dialog open={openEditDialog} onClose={handleEditClose} fullWidth>
            <DialogTitle>Rename selected file</DialogTitle>

            <Formik
                initialValues={{
                    new_filename: originalFileName ? originalFileName : "",
                }}
                onSubmit={(values, { resetForm }) => {
                    if (idEdit) {
                        handleUpdateFileSubmit(values);
                    }

                    resetForm();
                }}
                validationSchema={FileNamevalidationSchema}
            >
                {({ values, errors, touched, handleChange }) => (
                    <Form>
                        <DialogContent>
                            <Field
                                name="new_filename"
                                as={TextField}
                                label="New Filename"
                                fullWidth
                                value={values.new_filename}
                                error={
                                    errors.new_filename && touched.new_filename
                                }
                                helperText={
                                    touched.new_filename && errors.new_filename
                                }
                                onChange={handleChange}
                            />
                        </DialogContent>

                        <DialogActions>
                            <MUIButton
                                onClick={handleEditClose}
                                color="primary"
                            >
                                Cancel
                            </MUIButton>

                            <MUIButton
                                type="submit"
                                color="primary"
                                disabled={
                                    values.new_filename == originalFileName ||
                                    values.new_filename == ""
                                }
                            >
                                Rename
                            </MUIButton>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
}

export function editSelectedVideoDialog(
    openEditDialog,
    handleEditClose,
    originalVideoTitle,
    idEdit,
    handleUpdateFileSubmit,
    FileNamevalidationSchema
) {
    return (
        <Dialog open={openEditDialog} onClose={handleEditClose} fullWidth>
            <DialogTitle>Rename selected file</DialogTitle>

            <Formik
                initialValues={{
                    new_title: originalVideoTitle ? originalVideoTitle : "",
                }}
                onSubmit={(values, { resetForm }) => {
                    if (idEdit) {
                        handleUpdateFileSubmit(values);
                    }

                    resetForm();
                }}
                validationSchema={FileNamevalidationSchema}
            >
                {({ values, errors, touched, handleChange }) => (
                    <Form>
                        <DialogContent>
                            <Field
                                name="new_title"
                                as={TextField}
                                label="New Title"
                                fullWidth
                                value={values.new_title}
                                error={
                                    errors.new_title && touched.new_title
                                }
                                helperText={
                                    touched.new_title && errors.new_title
                                }
                                onChange={handleChange}
                            />
                        </DialogContent>

                        <DialogActions>
                            <MUIButton
                                onClick={handleEditClose}
                                color="primary"
                            >
                                Cancel
                            </MUIButton>

                            <MUIButton
                                type="submit"
                                color="primary"
                                disabled={
                                    values.new_title == originalVideoTitle ||
                                    values.new_title == ""
                                }
                            >
                                Rename
                            </MUIButton>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
}
