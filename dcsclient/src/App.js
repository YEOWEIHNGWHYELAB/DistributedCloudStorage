import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import { SnackbarProvider } from "notistack";

import ThemeModeProvider from "./Contexts/ThemeModeProvider";
import AuthContextProvider from './Contexts/AuthContextProvider';
import RequireAuth from './Contexts/RequireAuth';
import RequireNotAuth from './Contexts/RequireNotAuth';
import BaseLayout from './BaseLayout';

// Welcome Pages
import MainLandingWelcome from "./Pages/Welcome/PageSection/MainLanding";

// Authentication Pages
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import ForgotPassword from './Pages/Auth/ForgotPassword';

// Dashboard Pages
import MainLandingDash from "./Pages/Dashboard/Main/MainLanding"
import FileStat from "./Pages/Dashboard/FileStat/FileStat";
import PingStats from "./Pages/Dashboard/PingStat/PingStat";

// Main Storage Pages
import SMCO from './Pages/Main/SMCO';

// GitHub Pages
import CredentialsTableGH from "./Pages/GitHub/Credentials/CredentialTable";
import FileTableGH from "./Pages/GitHub/Files/FileTable";
import DeletedFileTableGH from "./Pages/GitHub/RecycleBin/DeletedFileTable";

// Google Pages
import CredentialsTableYT from "./Pages/Google/YouTube/Credentials/CredentialTable";
import CredentialsCreatorYT from "./Pages/Google/YouTube/Credentials/CredentialCreator";
import VideoTableYT from "./Pages/Google/YouTube/VideosTable/VideosTable";
import VideoTableYTCreator from "./Pages/Google/YouTube/VideosTable/SingleVideoCreator";
import YTDeletedFileTable from "./Pages/Google/YouTube/RecycleBin/YTDeletedFileTable";

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
                    {/**
                     * Dashboard
                     */}
                    <Route path="/dash" element={<MainLandingDash />} />
                    <Route path="/dash/filestat" element={<FileStat />} />
                    <Route path="/dash/pingstat" element={<PingStats />} />

                    {/**
                     * SMCOverlord
                     */}
                    <Route path="/smco" element={<SMCO />} />

                    {/**
                     * GitHub Manager
                     */}
                    <Route path="/github/credential" element={<CredentialsTableGH />} />
                    <Route path="/github/files" element={<FileTableGH />} />
                    <Route path="/github/delfiles" element={<DeletedFileTableGH />} />

                    {/**
                     * Google Manager
                     */}
                    <Route path="/google/credentialyt" element={<CredentialsTableYT />} />
                    <Route path="/google/credentialyt/creator" element={<CredentialsCreatorYT />} />
                    <Route path="/google/ytvideos" element={<VideoTableYT />} />
                    <Route path="/google/ytvideos/creator" element={<VideoTableYTCreator />} />
                    <Route path="/google/ytdelfiles" element={<YTDeletedFileTable />} />
                  </Route>
                </Route>
                <Route element={<RequireNotAuth />} >
                  {/**
                    * Welcome Landing Page
                    */}
                  <Route path="" element={<MainLandingWelcome />} />
                  {/**
                    * Authentication Manager
                    */}
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/register" element={<Register />} />
                  <Route path="/auth/forgotpw" element={<ForgotPassword />} />
                </Route>
              </Routes>
            </Box>
          </Router>
        </SnackbarProvider>
      </AuthContextProvider>
    </ThemeModeProvider>
  );
}

createRoot(document.getElementById('root')).render(<App />);
