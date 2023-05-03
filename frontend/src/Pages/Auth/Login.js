import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import { LoadingButton } from '@mui/lab';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Formik } from "formik";
import * as yup from "yup";
import { Link } from 'react-router-dom';

import RequestAuth from '../../Hooks/RequestAuth';

const validationSchema = yup.object({
  username: yup.string().required("Email Address / Username is required!"),
  password: yup.string().required("Password is required!")
})

export default function Login() {
  const { login, loading } = RequestAuth();

  const handleSubmit = (values) => {
    login(values)
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography component="h1" variant="h5">
          Login
        </Typography>

        <Formik 
          validationSchema={validationSchema} 
          validateOnBlur={false} 
          onSubmit={handleSubmit}
          initialValues={{
            username: "",
            password: ""
          }}>
          {(formik) => {
            return (
              <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username / Email Address"
                  name="username"
                  autoFocus
                  {...formik.getFieldProps("username")}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  {...formik.getFieldProps("password")}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={loading}
                  sx={{ mt: 3, mb: 2 }}
                >
                  Login
                </LoadingButton>
                <Grid container>
                  <Grid item xs>
                    <Link to="/auth/password-reset" key="reset-password" >
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link to="/auth/signup" keys="signup">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            )
          }}
        </Formik>
      </Box>
    </Container>
  );
}