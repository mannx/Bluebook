import * as React from "react";
import {Outlet, Form, useLoaderData, useNavigate} from "react-router-dom";

import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import {
    UrlGet,
    UrlApi2AUVView,
    UrlApi2AUVUpdate,
    GetPostOptions,
} from "../URLs";

import dayjs from "dayjs";

export default function AUV() {
    const nav = useNavigate();

    return (<>
        <Container>
        <DatePicker  views={['month', 'year']} onChange={(e) => {
            const month = e.month() + 1;        // month is 0 based, add 1 to correct
            const year = e.year();
            const url = "/auv/" + month + "/" + year;

            nav(url);
        }} />
        </Container>
        <Outlet />
        </>
    );
}

export async function loader({params}) {
    // get the data from the server
    const month = params.month;
    const year = params.year;
    const q = "?month=" + month + "&year=" + year;

    const url = UrlGet(UrlApi2AUVView) + q;
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

export async function action({request, params}) {
    const formData = await request.formData();

    // combine the data into arrays
    let auv = [];
    let hours = [];

    for(let i = 0; i <= 4; i++){
        const a = formData.get("auv" + i);
        if (a !== null) {
            auv.push(parseInt(a));
        }

        const h = formData.get("hours" + i);
        if (h !== null) {
            hours.push(parseInt(h));
        }
    }

    // build the object
    const body = {
        Month: parseInt(params.month),
        Year: parseInt(params.year),
        AUV: auv,
        Hours: hours,
    };

    // send to the server
    const opts = GetPostOptions(JSON.stringify(body));
    await fetch(UrlGet(UrlApi2AUVUpdate), opts);

    return null;
}

export function AUVLayout() { 
    // get the data from the server with dates and/or values
    const {data} = useLoaderData();

    const auv = getAuvData(data);

    return (
        <Container>
        <Form method="post"> 

        <Stack direction="row" spacing={2}>
            <Button variant="contained" type="submit">Update</Button>
        </Stack>

        <TableContainer component={Paper}>
        <Table>
        <TableHead>
            <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>AUV</TableCell>
                <TableCell>Hours</TableCell>
            </TableRow>
        </TableHead>

        <TableBody>
        {auv}
        </TableBody>

        </Table>
        </TableContainer>
        </Form>
        </Container>
    );
}

function getAuvData(data) {
    let auv = [];
    const end = data.Dates.length;

    for(let i = 0; i < end; i++) {
        auv.push(AUVData(data, i));
    }

    return auv.map( (o) => { return o; });
}

function AUVData(data, index) {
    // remove timezone info to prevent showing a previous day
    //  (date has UTC timezone and dayjs will shift that to local time)
    const dateStr = data.Dates[index].slice(0, data.Dates[index].length-10);

    // const date = dayjs(data.Dates[index]);
    const date=dayjs(dateStr);

    return (<>
        <TableRow key={index}>
            <TableCell>
                <DatePicker value={date} disabled tabIndex={-1}/>
            </TableCell>
            <TableCell>
        <TextField name={"auv"+index} id={"auv"+index} type="number" label="AUV" defaultValue={data.AUV[index]}/>
            </TableCell>
            <TableCell>
                <TextField name={"hours"+index} id={"hours"+index} type="number" label="Hours" defaultValue={data.Hours[index]}/>
            </TableCell>
        </TableRow>
        </>
    );
}
