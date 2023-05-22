import * as React from "react";
import Avatar from "@mui/material/Avatar";
import { LoadingButton } from "@mui/lab";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { Formik } from "formik";
import * as yup from "yup";
import { Link } from "react-router-dom";

import RequestAuth from "../../Hooks/RequestAuth";

const validationSchema = yup.object({
    username: yup.string().required("Username is required!"),
});

export default function ForgotPassword() {
    const { loading } = RequestAuth();

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >

                <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                    <LockOutlinedIcon />
                </Avatar>

                <Typography component="h1" variant="h5">
                    Forgot Password
                </Typography>

                <Formik
                    validationSchema={validationSchema}
                    validateOnBlur={false}
                    initialValues={{
                        username: "",
                    }}
                >
                    {(formik) => {
                        return (
                            <Box
                                component="form"
                                onSubmit={formik.handleSubmit}
                                noValidate
                                sx={{ mt: 1 }}
                            >
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    name="username"
                                    autoFocus
                                    {...formik.getFieldProps("username")}
                                    error={
                                        formik.touched.username &&
                                        Boolean(formik.errors.username)
                                    }
                                    helperText={
                                        formik.touched.username &&
                                        formik.errors.username
                                    }
                                />
                                <LoadingButton
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    loading={loading}
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Enter Username
                                </LoadingButton>

                                <Grid container>
                                    <Grid item>
                                        <Link to="/auth/login" keys="login">
                                            {"Go back to login page"}
                                        </Link>
                                    </Grid>
                                </Grid>
                            </Box>
                        );
                    }}
                </Formik>
            </Box>
        </Container>
    );
}
