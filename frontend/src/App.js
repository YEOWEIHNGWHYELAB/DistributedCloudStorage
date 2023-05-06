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
import VideoListAll from "./Pages/YouTube/VideoListAll";
import VideoListPaginated from "./Pages/YouTube/VideoListPaginated";
import CredentialsTable from "./Pages/GitHub/CredentialTable";


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
                    <Route path="/dashboard/pingstats" element={<PingStats />}/>
                    <Route path="/youtube/listall" element={<VideoListAll />}/>
                    <Route path="/youtube/listpg" element={<VideoListPaginated />}/>
                    <Route path="/github/credential" element={<CredentialsTable />}/>
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
