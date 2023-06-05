import {
    Button as MUIButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Select,
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
            <DialogTitle>Rename selected item</DialogTitle>

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
                                label="New Name"
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
    originalVideoDescription,
    originalVideoPrivacy,
    idEdit,
    handleUpdateFileSubmit,
    FileNamevalidationSchema
) {
    const privacyOptions = [
        { label: 'Public', value: 'public' },
        { label: 'Unlisted', value: 'unlisted' },
        { label: 'Private', value: 'private' }
    ];

    return (
        <Dialog open={openEditDialog} onClose={handleEditClose} fullWidth>
            <DialogTitle>Rename selected file</DialogTitle>

            <Formik
                initialValues={{
                    new_title: originalVideoTitle ? originalVideoTitle : "",
                    new_description: originalVideoDescription ? originalVideoDescription : "",
                    new_privacy: originalVideoPrivacy ? originalVideoPrivacy : "public"
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

                            <br />
                            <br />

                            <Field
                                name="new_description"
                                as={TextField}
                                label="New Description"
                                fullWidth
                                multiline
                                rows={4}
                                value={values.new_description}
                                error={
                                    errors.new_description && touched.new_description
                                }
                                helperText={
                                    touched.new_description && errors.new_description
                                }
                                onChange={handleChange}
                            />

                            <br />
                            <br />

                            <Field
                                name="new_privacy"
                                as={Select}
                                fullWidth
                                values={values.new_privacy}
                            >
                                {privacyOptions.map((option) => (
                                    <MenuItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Field>
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
                                    (values.new_title == originalVideoTitle ||
                                        values.new_title == "") &&
                                    (values.new_description == originalVideoDescription ||
                                        values.new_description == "") &&
                                    (values.new_privacy == originalVideoPrivacy ||
                                        values.new_privacy == "")
                                }
                            >
                                Edit Meta Info
                            </MUIButton>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
}
