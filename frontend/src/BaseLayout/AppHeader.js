import {
    AppBar,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
    Box,
    Modal,
    TextField,
    CircularProgress,
    useTheme
} from "@mui/material";
import PropTypes from "prop-types";
import { AccountCircle } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import React from "react";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

import { AuthContext } from "../Contexts/AuthContextProvider"
import { ThemeModeContext } from "../Contexts/ThemeModeProvider";
import RequestAuth from "../Hooks/RequestAuth";

const drawerWidth = 240;

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "50%",
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

export function AppHeader({ mobileOpen, setMobileOpen }) {
    const themeMode = React.useContext(ThemeModeContext);
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const [modalIsOpen, setModalIsOpen] = React.useState(false);
    const [pwdModalIsOpen, setPwdModalIsOpen] = React.useState(false);
    const { user } = React.useContext(AuthContext);
    const { logout, logoutPending, resetPassword } = RequestAuth();
    const [oldPassword, setOldPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');

    const handleLogout = () => {
        logout();
    }

    const handleOpenPwdModal = () => {
        setPwdModalIsOpen(true);
        setAnchorEl(null);
    }

    const handleOpenModal = () => {
        setModalIsOpen(true);
        setAnchorEl(null);
    }

    const handleClosePwdModal = () => {
        setPwdModalIsOpen(false);
    }

    const handleCloseModal = () => {
        setModalIsOpen(false);
    }

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleChangeOldPwd = (event) => {
        setOldPassword(event.target.value);
    };

    const handleChangeNewPwd = (event) => {
        setNewPassword(event.target.value);
    }

    const handleChangePassword = () => {
        const pwdChange = {
            old_password: oldPassword,
            new_password: newPassword
        };
        
        setOldPassword("");
        setNewPassword("");

        resetPassword(pwdChange);
    }

    const pwdModal = (
        <Modal open={pwdModalIsOpen} onClose={handleClosePwdModal}>
            <Box sx={modalStyle}>
                <Typography variant="h6" component="h2" sx={{
                    mb: 3
                }}>
                    Change Password
                </Typography>

                <TextField
                    id="oldpassword"
                    variant="outlined"
                    label="Old Password"
                    autoComplete="old-password"
                    type="password"
                    value={oldPassword}
                    onChange={handleChangeOldPwd}
                    sx={{
                        mb: 3,
                        width: "100%"
                    }}
                />

                <TextField
                    id="newpassword"
                    variant="outlined"
                    label="New Password"
                    autoComplete="new-password"
                    type="password"
                    value={newPassword}
                    onChange={handleChangeNewPwd}
                    sx={{
                        mb: 3,
                        width: "100%"
                    }}
                />

                <Button 
                    onClick={handleChangePassword} 
                    color="primary"
                    style={{
                        background: "grey"
                    }}
                >
                    <Typography fontWeight={700}>Change Password</Typography>
                </Button>
            </Box>
        </Modal>
    )

    const modal = (
        <Modal open={modalIsOpen} onClose={handleCloseModal}>
            <Box sx={modalStyle}>
                <Typography variant="h6" component="h2" sx={{
                    mb: 3
                }}>
                    My Profile
                </Typography>

                <TextField
                    id="username"
                    variant="outlined"
                    label="Username"
                    value={user ? user.username : ""}
                    disabled
                    sx={{
                        mb: 3,
                        width: "100%"
                    }}
                />

                <TextField
                    id="email"
                    variant="outlined"
                    label="Email"
                    value={user ? user.email : ""}
                    disabled
                    sx={{
                        mb: 3,
                        width: "100%"
                    }}
                />
            </Box>
        </Modal>
    );

    const authLinks = (
        <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton sx={{ ml: 1 }} onClick={themeMode.toggleThemeMode}>
                {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                size="large"
            >
                <AccountCircle />
            </IconButton>

            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={handleOpenModal}>
                    My Profile
                </MenuItem>

                <MenuItem onClick={handleOpenPwdModal}>
                    Change Password
                </MenuItem>

                <MenuItem disabled={logoutPending} onClick={handleLogout}>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>

                        {logoutPending === true ? <CircularProgress size={20} sx={{
                            mr: 2
                        }} /> : null}
                    </Box>
                    Logout
                </MenuItem>
            </Menu>
        </Box>
    );

    return (
        <AppBar
            position="fixed"
            xs={{
                width: { md: `calc(100% - ${drawerWidth}px)` },
                ml: { md: `${drawerWidth}px` },
            }}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { md: "none" } }}
                >
                    <MenuIcon />
                </IconButton>

                <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                    DISTRIBUTED CLOUD STORAGE SYSTEM
                </Typography>
                {authLinks}
            </Toolbar>
            {modal}
            {pwdModal}
        </AppBar>
    );
}

AppHeader.propTypes = {
    mobileOpen: PropTypes.bool,
    setMobileOpen: PropTypes.func.isRequired,
};

export default AppHeader;
