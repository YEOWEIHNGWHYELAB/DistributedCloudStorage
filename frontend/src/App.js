import React from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import { SnackbarProvider } from "notistack";

import Login from "./Pages/Auth/Login"
import ThemeModeProvider from "./Contexts/ThemeModeProvider"
import AuthContextProvider from './Contexts/AuthContextProvider';
import RequireAuth from './Contexts/RequireAuth';
import RequireNotAuth from './Contexts/RequireNotAuth';
import BaseLayout from './BaseLayout';
import PingStats from "./Pages/Dashboard/PingStats";
import VideoList from "./Pages/YouTube/VideoList";


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
                    <Route path="/youtube/list" element={<VideoList />}/>
                  </Route>
                </Route>
                <Route element={<RequireNotAuth />} >
                  <Route path="/auth/login" element={<Login />} />
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
