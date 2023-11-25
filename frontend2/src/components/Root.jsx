import * as React from 'react';
import {Outlet, NavLink, useNavigate, useLoaderData} from "react-router-dom";
import "./header.css";

import {UrlGet, UrlApiGetNotifications, UrlApiClearNotifications, GetPostOptions} from "./URLs";

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';

export default function Root() {
    const {data} = useLoaderData();

    return (
        <>
        {navHeader2(data)}
        <div><Outlet /></div>
        </>
    );
}

export async function loader(){
    const url = UrlGet(UrlApiGetNotifications);
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

function navHeader2(data) {
    const pages = [
        {
            Title: "Today",
            Url: "/today",
        },
        {
            Title: "Search Tags",
            Url: "/tags",
        },
        {
            Title: "Weekly Info",
            Url: "/weekly",
        },
        {
            Title: "AUV",
            Url: "/auv",
        },
        {
            Title: "Wastage",
            Url: "/wastage",
        },
        {
            Title: "Top 5",
            Url: "/top5",
        },
        {
            Title: "Import",
            Url: "/import",
        },
        {
            Title: "Waste Input",
            Url: "/waste/input",
        },
    ];

    const settingsMenu = [
        {
            Title: "Backups",
            Url: "/settings",
        },
        {
            Title: "Waste Settings",
            Url: "/waste/settings",
        },
        {
            Title: "Comment Search",
            Url: "/search",
        },
        {
            Title: "Hockey Schedule",
            Url: "/hockey",
        },
        {
            Title: "Hockey Data",
            Url: "/hockey/data",
        },
        {
            Title: "Simple Stats",
            Url: "/stats/simple",
        }
    ];

    const [anchorE1user, setAnchorE1user] = React.useState(null);
    const [notifVisible, setNotifVisible] = React.useState(null);

    const navigate = useNavigate();
    let numNotifs = (data !== undefined && data !== null) ? data.length : 0;

    const settingsHandler = (e) => {
        setAnchorE1user(e.currentTarget);
    }

    const handleCloseUserMenu = () => {
        setAnchorE1user(null);
    }

    const showNotif = (e) => {
        setNotifVisible(e.currentTarget);
    }

    const handleCloseNotif = async () => {
        // clear the notification counter once we close the window
        numNotifs = 0;

        setNotifVisible(null);

        // let the backend know we have shown the notifications that we were shown
        const url = UrlGet(UrlApiClearNotifications);

        // we need to send id's of each notification we were shown
        let body = [];
        for(let i = 0; i < numNotifs; i++){
            body.push(data[i].ID);
        }

        const opt = GetPostOptions(JSON.stringify(body));
        await fetch(url, opt); // we don't care about any return data
    }


    return (
        <Box sx={{flexGrow:1}} className="no-print" >
        <AppBar position="static">

        <Toolbar variant="dense">
        <Box sx={{flexGrow: 1, display: {xs:'none',md: 'flex'} }}>
        {pages.map( (p) => (
            <NavLink key={p.Title} to={p.Url} className={({isActive, isPending}) => isPending ? "pending" : isActive ? "active" : ""}>
            <Button key={p.Title} sx={{my:2,color:'white',display: 'block', "text-decoration": "none" }}>{p.Title}</Button>
            </NavLink>
        ))}
        </Box>

        <Box sx={{ flexGrow: 0}}>

            <Tooltip title="Settings">
                <IconButton onClick={settingsHandler} sx={{p:0}}>
                    <SettingsIcon />
                </IconButton>
            </Tooltip>

            <IconButton size="large" color="inherit" onClick={showNotif}>
                <Badge badgeContent={numNotifs} color="error">
                    <NotificationsIcon/>
                </Badge>
            </IconButton>

            <Menu sx={{mt:'45px'}} id='menu-appbar' anchorEl={notifVisible} anchorOrigin={{vertical: 'top', horizontal: 'right',}} keepMounted transformOrigin={{vertical: 'top', horizontal: 'right',}} open={Boolean(notifVisible)} onClose={handleCloseNotif}>
                {data.map( (item, i) => {
                    return <MenuItem key={i}>
                        <Typography>{item.Message}</Typography>
                    </MenuItem>;
                })}
            </Menu>

            <Menu sx={{mt:'45px'}} id='menu-appbar' anchorEl={anchorE1user} anchorOrigin={{vertical: 'top', horizontal: 'right',}} keepMounted transformOrigin={{vertical: 'top', horizontal: 'right',}} open={Boolean(anchorE1user)} onClose={handleCloseUserMenu}>
                {settingsMenu.map( (item, i) => {
                    return <MenuItem key={i} onClick={()=>{navigate(item.Url)}}>
                        <Typography textAlign="center">{item.Title}</Typography>
                        </MenuItem>
                })}
            </Menu>
        </Box>

        </Toolbar>

        </AppBar>
        </Box>
    );
}
