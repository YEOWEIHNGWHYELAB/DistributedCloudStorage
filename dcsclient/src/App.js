import React from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import { SnackbarProvider } from "notistack";

import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register"
import ThemeModeProvider from "./Contexts/ThemeModeProvider";
import AuthContextProvider from './Contexts/AuthContextProvider';
import RequireAuth from './Contexts/RequireAuth';
import RequireNotAuth from './Contexts/RequireNotAuth';
import BaseLayout from './BaseLayout';
import PingStats from "./Pages/Dashboard/PingStats";
import VideoTable from "./Pages/Google/YouTube/VideosTable";
import CredentialsTableYT from "./Pages/Google/Credentials/CredentialTable";
import CredentialsTableGH from "./Pages/GitHub/Credentials/CredentialTable";
import FileTable from "./Pages/GitHub/Files/FileTable";


export default function App() {
  return (
    <ThemeModeProvider>
      <CssBaseline />
      <AuthContextProvider>
        <SnackbarProvider>
          <Router>
            <Box sx={{
              bgcolor: (theme) => theme.palette.background.default, minHeight: "100vh", width: "100%"
            }}>
              <Routes>
                <Route element={<RequireAuth />}>
                  <Route element={<BaseLayout />}>
                    <Route path="/dashboard/pingstats" element={<PingStats />} />
                    <Route path="/github/credential" element={<CredentialsTableGH />} />
                    <Route path="/github/files" element={<FileTable />} />
                    <Route path="/google/credential" element={<CredentialsTableYT />} />
                    <Route path="/google/videos" element={<VideoTable />} />
                  </Route>
                </Route>
                <Route element={<RequireNotAuth />} >
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/register" element={<Register />} />
                </Route>
              </Routes>
            </Box>
          </Router>
        </SnackbarProvider>
      </AuthContextProvider>
    </ThemeModeProvider>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
