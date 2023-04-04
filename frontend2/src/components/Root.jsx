import {Outlet, NavLink} from "react-router-dom";
import "./header.css";

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';

export default function Root() {
    return (
        <>
        {navHeader2()}
        <div><Outlet /></div>
        </>
    );
}

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
            Title: "Waste Settings",
            Url: "/waste/settings",
        },
        {
            Title: "Waste Input",
            Url: "/waste/input",
        },
    ];

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
        </Toolbar>

        </AppBar>
        </Box>
    );
}
