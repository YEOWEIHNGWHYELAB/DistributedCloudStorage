import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, NavLink, useNavigate } from "react-router-dom";

import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import YouTubeIcon from "@mui/icons-material/YouTube";
import SpeedIcon from "@mui/icons-material/Speed";
import GitHubIcon from "@mui/icons-material/GitHub";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import ListIcon from "@mui/icons-material/List";
import AddIcon from '@mui/icons-material/Add';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import KeyIcon from '@mui/icons-material/Key';
import PieChartIcon from '@mui/icons-material/PieChart';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';

import { Box } from "@mui/system";
import { GlobalStyles, useTheme } from "@mui/material";

const drawerWidth = 300;

const listItems = [
    {
        key: "dashboard",
        to: "/",
        name: "Dashboard",
        icon: <SpeedIcon />,
        children: [
            { name: "Ping Stat", icon: <NetworkCheckIcon />, to: "/dash/pingstat"},
            { name: "Storage Usage", icon: <PieChartIcon />, to: "/dash/storageutil" },
        ],
    },
    {
        key: "youtube",
        to: "/youtube",
        name: "YouTube",
        icon: <YouTubeIcon />,
        children: [
            { name: "Upload Video", icon: <AddIcon />, to: "/youtube/upload" },
            { name: "List All Videos", icon: <ListIcon />, to: "/youtube/listall" },
            { name: "List Videos Paginated", icon: <ListIcon />, to: "/youtube/listpg" },
        ],
    },
    {
        key: "github",
        to: "/github",
        name: "GitHub",
        icon: <GitHubIcon />,
        children: [
            { name: "Credential List", icon: <KeyIcon />, to: "/github/credential" },
            { name: "Create Repo", icon: <AddIcon />, to: "/github/createrepo" },
            { name: "Repo List", icon: <ListIcon />, to: "/github/repolist" },
        ],
    },
];

const SidebarGlobalStyles = () => {
    const theme = useTheme();

    return (
        <GlobalStyles
            styles={{
                ".sidebar-nav-item": {
                    color: "unset",
                    textDecoration: "none",
                },
                ".sidebar-nav-item-active": {
                    textDecoration: "none",
                    color: theme.palette.primary.main,
                    "& .MuiSvgIcon-root": {
                        color: theme.palette.primary.main,
                    },
                    "& .MuiTypography-root": {
                        fontWeight: 500,
                        color: theme.palette.primary.main,
                    },
                },
            }}
        />
    );
};

const SidebarGlobalStylesMemo = React.memo(SidebarGlobalStyles);

const NestedListItem = ({ li }) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleItemClick = () => {
        navigate(li.to);
    };

    const handleDropdownClick = (event) => {
        event.stopPropagation();
        setOpen(!open);
    };

    return (
        <>
            <ListItem onClick={handleItemClick} >
                <ListItemIcon>{li.icon}</ListItemIcon>
                <ListItemText primary={li.name} />
                {open ? (
                    <ExpandLess onClick={handleDropdownClick} />
                ) : (
                    <ExpandMore onClick={handleDropdownClick} />
                )}
            </ListItem>

            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {li.children.map((child) => (
                        <NavLink
                            end={li.to === "/" ? true : false}
                            className={(props) => {
                                return `${
                                    props.isActive
                                        ? "sidebar-nav-item-active"
                                        : "sidebar-nav-item"
                                }`;
                            }}
                            to={child.to}
                            key={li.key}
                        >
                            <ListItem 
                                key={child.name}
                                style={{ paddingLeft: 32, paddingRight: 16, borderLeft: '3px solid transparent' }}>
                                <ListItemIcon>{child.icon}</ListItemIcon>
                                <ListItemText primary={child.name} />
                            </ListItem>
                        </NavLink>
                    ))}
                </List>
            </Collapse>
        </>
    );
};

export function SideMenu(props) {
    const { mobileOpen, setMobileOpen } = props;

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <Box>
            <Toolbar />
            <Divider />
            <List>
                {listItems.map((li) => {
                    return (
                        <NestedListItem key={li.name} li={li} />
                    );
                })}
            </List>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, flexShrink: { sm: 0 } }}
        >
            <SidebarGlobalStylesMemo />

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: "block", sm: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: drawerWidth,
                    },
                }}
            >
                {drawer}
            </Drawer>
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", sm: "none", md: "block" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: drawerWidth,
                    },
                }}
                open
            >
                {drawer}
            </Drawer>
        </Box>
    );
}

SideMenu.propTypes = {
    mobileOpen: PropTypes.bool,
    setMobileOpen: PropTypes.func.isRequired,
};

export default SideMenu;
