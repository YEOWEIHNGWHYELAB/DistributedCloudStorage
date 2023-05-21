import React, { useState, useRef } from "react";
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
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import RequestResource from "../../../../Hooks/RequestResource";

const privacyOptions = [
    { label: 'Public', value: 'public' },
    { label: 'Unlisted', value: 'unlisted' },
    { label: 'Private', value: 'private' },
];

const initialValues = {
    title: '',
    description: '',
    privacy: 'public',
};

const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    privacy: Yup.string().required('Privacy status is required'),
});

function SingleVideoCreator() {
    const handleSubmit = (values, { resetForm }) => {
        console.log('Submitted:', values.title, values.description, values.privacy);

        // Reset the form
        // resetForm();
    };

    const handleReset = (resetForm) => {
        resetForm();
    };

    return (
        <div>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ resetForm, errors, touched }) => (
                    <Form>
                        <MUIButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            style={{ margin: "2px" }}
                        >
                            Upload
                        </MUIButton>

                        <MUIButton
                            type="button"
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleReset(resetForm)}
                        >
                            Reset
                        </MUIButton>


                        <br />
                        <br />

                        <Field
                            as={TextField}
                            label="Title"
                            name="title"
                            error={
                                errors.title && touched.title
                            }
                            helperText={
                                touched.title && errors.title
                            }
                            fullWidth
                        />

                        <br />
                        <br />

                        <Field
                            as={TextField}
                            label="Description"
                            name="description"
                            multiline
                            rows={4}
                            fullWidth
                            error={
                                errors.description && touched.description
                            }
                            helperText={
                                touched.description && errors.description
                            }
                        />

                        <br />
                        <br />

                        <Field
                            as={Select}
                            name="privacy"
                            fullWidth
                        >
                            {privacyOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Field>
                    </Form>
                )}
            </Formik>

            <br />
            <br />

            <Link to="/google/ytvideos">
                <MUIButton
                    style={{
                        border: "2px solid grey",
                        margin: "2px",
                        borderRadius: "4px",
                        padding: "8px",
                        width: "15%",
                        boxSizing: "border-box",
                    }}
                >
                    Back
                </MUIButton>
            </Link>
        </div>
    );
}

export default SingleVideoCreator;
