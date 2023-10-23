import * as React from "react";
import {useLoaderData} from "react-router-dom";
import {UrlGet, UrlApiHockeyData} from "../URLs.jsx";
import {dayLink} from "../Tags/Tags";
import {NumberFormat} from "../Month/MonthView";

// import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

// import Typography from '@mui/material/Typography';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

export async function loader({params}){
    const year = params.year !== undefined ? "?year="+params.year : "";
    const url = UrlGet(UrlApiHockeyData) + year;
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

export default function HockeyData() {
    const {data} = useLoaderData();
    const [year, setYear] = React.useState(0);
    const updateYear = (e) => {setYear(e.target.value)}

    return (<>
    <Container>
    <h3>Hockey Data</h3>

    <Stack spacing={2}>
        <InputLabel id="year">Year</InputLabel>
        <Select labelId="year" id="year-select" value={year} onChange={updateYear}>

        </Select>
    </Stack>
    
    <TableContainer component={Paper}>
    <Table size="small" sx={{width: 1/2}}>
        <TableHead>
        <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Net Sales</TableCell>
            <TableCell>Average Sales</TableCell>
            <TableCell>Away Team</TableCell>
            <TableCell>Score (Home - Away)</TableCell>
        </TableRow></TableHead>

        <TableBody>
        {data !== null && data.map( (obj, i) => {
            const cls = obj.NetSales >= obj.Average ? "NetSalesUp" : "NetSalesDown";

            return (<TableRow key={i}>
                <TableCell>{dayLink(obj.Date)}</TableCell>
                <TableCell className={cls}>{NumberFormat(obj.NetSales)}</TableCell>
                <TableCell>{NumberFormat(obj.Average)}</TableCell>
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