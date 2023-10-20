import * as React from "react";
import {useLoaderData} from "react-router-dom";
import {UrlGet, UrlApiHockeyData} from "../URLs.jsx";
import {dayLink} from "../Tags/Tags";

// import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
// import Stack from '@mui/material/Stack';

// import Typography from '@mui/material/Typography';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export async function loader(){
    const url = UrlGet(UrlApiHockeyData);
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

export default function HockeyData() {
    const {data} = useLoaderData();

    return (<>
    {/* <Container component={Paper}> */}
    <Container>
    <h3>Hockey Data</h3>
    <TableContainer component={Paper}>
    <Table size="small" sx={{width: 1/2}}>
        <TableHead>
        <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Net Sales</TableCell>
            <TableCell>Average Sales</TableCell>
            <TableCell>Away Team</TableCell>
            <TableCell>Score (Home - Away)</TableCell>
        </TableRow></TableHead>

        <TableBody>
        {data !== null && data.map( (obj, i) => {
            return (<TableRow key={i}>
                <TableCell></TableCell>
                <TableCell>{dayLink(obj.Date)}</TableCell>
                <TableCell>{obj.NetSales}</TableCell>
                <TableCell>{obj.Average}</TableCell>
                <TableCell>{obj.AwayTeam}</TableCell>
                <TableCell>{obj.GFHome} - {obj.GFAway}</TableCell>
                </TableRow>
            );
        })}
        </TableBody>
    </Table>
    </TableContainer>
    </Container>
    </>);
}