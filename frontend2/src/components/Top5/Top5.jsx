import * as React from "react";
import {Outlet, Link, useLoaderData} from "react-router-dom";

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
// import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import {
    UrlGet,
    UrlApiTop5,
    UrlApiTop5Data,
} from "../URLs";

// import UrlApiTop5Data from "../URLs";

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export async function loader() {
    const url = UrlGet(UrlApiTop5);
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

export default function Top5() {
    const {data} = useLoaderData();

    const [month, setMonth] = React.useState(0);
    const [year, setYear] = React.useState("0");

    const updateMonth = (e) => { setMonth(e.target.value); }
    const updateYear = (e) => {setYear(e.target.value); }

    const loadData = () => {};

    return (<>
        <Container component={Paper}>
        <h3>Top 5</h3>

        <Stack spacing={2}>

        <InputLabel id='month'>Month</InputLabel>
        <Select labelId='month' id='month-select' value={month} label='MonthL' onChange={updateMonth}>
        {monthNames.map( (n, i) => { 
            return <MenuItem key={i} value={i}>{n}</MenuItem>;
        })}
        </Select>


        <InputLabel id='year'>Year</InputLabel>
        <Select labelId='year' value={year} onChange={updateYear}>
        <MenuItem key={-1} value="0">Any</MenuItem>
        {data.map( (n) => {
            return <MenuItem key={n} value={n}>{n}</MenuItem>;
        })}
        </Select>

        <Link to={`/top5/${month+1}/${year}`}>
        <Button variant="contained" >View</Button>
        </Link>
        </Stack>

        </Container>
        <Outlet/>

        </>);
}

// top5Data loader /:month/:year  if either is unused, is 0
export async function dataLoader({params}) {
    // const p = "?month=${params.month}&year=${params.year}&limit=5";
    const p = "?month=" + params.month + "&year=" + params.year + "&limit=5";
    const url = UrlGet(UrlApiTop5Data) + p;
    const resp = await fetch(url);
    const data = await resp.json();

    return {
        ...data,
        ...params,
    };
}

export function Top5Data() {
    const data = useLoaderData();
    console.log(data);

    // return (
    //     <TableContainer sx={{width: 1/2}} >
    //     <Table>
    //     </Table>
    //     </TableContainer>
    // );

    return data.Data.map( (n) => {
        return <span>{n.Title}</span>;
    });
}
