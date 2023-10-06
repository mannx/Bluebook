import * as React from 'react';
import {Outlet, NavLink, useNavigate} from "react-router-dom";
import "./header.css";

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
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import {styled, alpha} from '@mui/material/styles';

export default function Root() {
    return (
        <>
        {navHeader2()}
        <div><Outlet /></div>
        </>
    );
}

// const Search = styled('div')(( {theme }) => ({
//     position: 'relative',
//     borderRadius: theme.shape.borderRadius,
//     backgroundColor: alpha(theme.palette.common.white, 0.15),
//     '&:hover':{
//         backgroundColor: alpha(theme.palette.common.white, 0.25),
//     },
//     marginLeft: 0,
//     width: '100%',
//     [theme.breakpoints.up('sm')]: {
//         marginLeft: theme.spacing(1),
//         width: 'auto',
//     },
// }));

// const SearchIconWrapper = styled('div')(({theme}) => ({
//     padding: theme.spacing(0, 2),
//     height: '100%',
//     position: 'absolute',
//     pointerEvents: 'none',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
// }));

// const StyledInputBase = styled(InputBase)(({theme}) => ({
//     color: 'inherit',
//     '& .MuiInputBase-input': {
//         padding: theme.spacing(1, 1, 1, 0),
//         paddingLeft: `calc(1em + ${theme.spacing(4)})`,
//         transition: theme.transitions.create('width'),
//         width: '100%',
//         [theme.breakpoints.up('sm')]: {
//             width: '12ch',
//             '&:focus': {
//                 width: '20ch',
//             },
//         },
//     },
// }));

function navHeader2() {
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
        {
            Title: "Debug Page",
            Url: "/debug",
        },
    ];

    const settingsMenu = [
        {
            Title: "DB Settings",
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
    ];

    const [anchorE1user, setAnchorE1user] = React.useState(null);

    const navigate = useNavigate();

    const settingsHandler = (e) => {
        setAnchorE1user(e.currentTarget);
    }

    const handleCloseUserMenu = () => {
        setAnchorE1user(null);
    }

    
    return (
        <Box sx={{flexGrow:1}} className="no-print" >
        <AppBar position="static">

        <Toolbar variant="dense">
        <Box sx={{flexGrow: 1, display: {xs:'none',md: 'flex'} }}>
        {pages.map( (p) => (
            <NavLink key={p.Title} to={p.Url} className={({isActive, isPending}) => isPending ? "pending" : isActive ? "active" : ""}>
            <Button key={p.Title} sx={{my:2,color:'white',display: 'block' }}>{p.Title}</Button>
            </NavLink>
        ))}
        </Box>

        <Box sx={{ flexGrow: 0}}>

            <Tooltip title="Settings">
                <IconButton onClick={settingsHandler} sx={{p:0}}>
                    <SettingsIcon />
                </IconButton>
            </Tooltip>

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
