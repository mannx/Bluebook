import * as React from "react";
import {Form, useLoaderData} from "react-router-dom";

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

import dayjs from "dayjs";

// return an array of all the week endings for a given month
function getWeekendings(month, year) {
    // month is 0 based, so sub 1
    month -= 1;
    let days = [];
    let day = 1;
    let done = false;
    let date = new Date(year, month, 1);    // initial date

    do {
        // do we have a tuesday?
        if( date.getDay() === 2) {
            // add to the list
            days.push(new Date(year, month, day));
        }

        // next day
        day += 1;
        date.setDate(day);

        // check if different month
        if(date.getMonth() !== month) {
            done = true;
        }
    }while(!done);

    return days;
}

export default function AUV() {
    const [date, setDate] = React.useState(null); 
    const {data} = useLoaderData();

    let weekEndings = [];
    if(date !== null) {
        weekEndings = getWeekendings(date.month()+1, date.year());
    }

    return (<>
        <Container>
        <DatePicker value={date} views={['month', 'year']} onChange={(e) => setDate(e)} />
        </Container>

        <Container>
        <Form method="post"> 

        {date !== null ?
        <Stack direction="row" spacing={2}>
            <Button variant="contained" type="submit">Update</Button>
        </Stack>
            : <></>
        }

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
        {weekEndings !== null ?
            weekEndings.map( (o, i) => {
                return AUVData(o, i);
            }) : <></>
        }
        </TableBody>

        </Table>
        </TableContainer>
        </Form>
        </Container>
        </>
    );
}

function AUVData(weekEnding, index) {
    const d = dayjs(weekEnding);

    return (<>
        <TableRow key={index}>
            <TableCell>
                <DatePicker value={d} disabled tabIndex={-1}/>
            </TableCell>
            <TableCell>
                <TextField id={"auv"+index} type="number" label="AUV"/>
            </TableCell>
            <TableCell>
                <TextField id={"hours"+index} type="number" label="Hours"/>
            </TableCell>
        </TableRow>
        </>
    );
}
