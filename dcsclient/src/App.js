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

// Authentication Pages
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";

// Dashboard Pages
import MainLandingDash from "./Pages/Dashboard/Main/MainLanding"
import FileStat from "./Pages/Dashboard/FileStat/FileStat";
import PingStats from "./Pages/Dashboard/PingStat/PingStat";

// GitHub Pages
import MainLandingGH from "./Pages/GitHub/Main/MainLanding"
import CredentialsTableGH from "./Pages/GitHub/Credentials/CredentialTable";
import FileTableGH from "./Pages/GitHub/Files/FileTable";
import DeletedFileTableGH from "./Pages/GitHub/RecycleBin/DeletedFileTable";

// Google Pages
import MainLandingGG from "./Pages/Google/Main/MainLanding"
import VideoTableYT from "./Pages/Google/YouTube/VideosTable";
import CredentialsTableGG from "./Pages/Google/Credentials/CredentialTable";
import YTDeletedFileTable from "./Pages/Google/RecycleBin/YTDeletedFileTable"

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
                     * GitHub Manager
                     */}
                    <Route path="/github" element={<MainLandingGH />} />
                    <Route path="/github/credential" element={<CredentialsTableGH />} />
                    <Route path="/github/files" element={<FileTableGH />} />
                    <Route path="/github/delfiles" element={<DeletedFileTableGH />} />

                    {/**
                     * Google Manager
                     */}
                    <Route path="/google" element={<MainLandingGG />} />
                    <Route path="/google/credential" element={<CredentialsTableGG />} />
                    <Route path="/google/youtube" element={<VideoTableYT />} />
                    <Route path="/google/ytdelfiles" element={<YTDeletedFileTable />} />
                  </Route>
                </Route>
                <Route element={<RequireNotAuth />} >
                  {/**
                    * Authentication Manager
                    */}
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

createRoot(document.getElementById('root')).render(<App />);
