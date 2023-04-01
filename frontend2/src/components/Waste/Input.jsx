// Input.jsx is used to entry wastage entries to be later combined and shown with Wastage.jsx

import * as React from "react";
import {Form, useLoaderData} from "react-router-dom";
// import {NumericFormat} from "react-number-format";

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import Picker from "./Picker";
// import DatePicker  from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';

import {
    UrlGet,
    UrlApiWasteNames,
    UrlApiWasteHolding,
    GetPostOptions,
} from "../URLs";



const notTuesday = (date) => {
    return date.day() !== 2;
}

// function WasteTest(params) {
//     console.log(params);

//     return (
//         <><span>Waste Test</span></>
//     );
// }

// load the current waste data in the holding table, the waste names for autocomplete
export async function loader({params}) {
    // retrieve all wastage item names
    const nameUrls = UrlGet(UrlApiWasteNames);
    const namesResp = await fetch(nameUrls);
    const names = {
        Names: await namesResp.json(),
    };

    // retrieve all items currently in the wastage holding table
    const holdUrls = UrlGet(UrlApiWasteHolding);
    const holdResp = await fetch(holdUrls);
    const holding = {
        Holding: await holdResp.json(),
    };

    return {
        ...params,
        ...names,
        ...holding,
    };
}

export async function action({request, params}) {
    // add the item to the holding db
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);

    console.log(updates);

    return null;
}

export default function WasteInput() {
    const [date, setDate] = React.useState(null);
    const [wasteDate, setWasteDate] = React.useState(null);
    
    const data = useLoaderData();

    const names = data.Names;

    return (<>
        <Container>
        <h3>Waste Input</h3>
        <span>Week Ending:</span><br/>
        <DatePicker value={date} onChange={(e)=>setDate(e)} shouldDisableDate={notTuesday} />
        <Button variant="contained">Submit</Button>
        </Container>

        <TableContainer component={Paper} >
        <Form method="post">

        <Table>
        <TableHead>
        <TableRow>
            <th className="Month">Date</th>
            <th className="Month">Item</th>
            <th className="Month">Quantity</th>
            <th className="Month">Reason</th>
            <th className="Month"></th>
        </TableRow>
        </TableHead>

        <TableBody>
        {data.Holding !== null && data.Holding.map( (obj) => {
            return (<TableRow>
                <TableCell>{obj.Month}/{obj.Day}/{obj.Year}</TableCell>
                <TableCell>{obj.Name}</TableCell>
                <TableCell>{obj.Quantity}</TableCell>
                <TableCell>{obj.Reason}</TableCell>
                <TableCell><Button>Delete</Button></TableCell>
                </TableRow>);
        })}

        <TableRow>
            <TableCell>
                <DatePicker value={wasteDate} onChange={(e) => setWasteDate(e) }/>
                {wasteDate !== null &&
                <input type="hidden" name="date" value={wasteDate.format("DD-MM-YYYY")} /> 
                }
            </TableCell>
            <TableCell>
        <Autocomplete autoSelect autoHighlight id="freeSolo" options={names.map( (n) => n) }
        renderInput={(params) => <TextField {...params} label="Name" name="Name"/>} />
            </TableCell>
            <TableCell>
                <TextField label="Quantity" type="number" variant="standard" name="Quantity"/>
            </TableCell>
            <TableCell>
                <TextField label="Reason" variant="standard" name="Reason"/>
            </TableCell>
            <TableCell>
                <Button type="submit">Add</Button>
            </TableCell>
        </TableRow>

        </TableBody>
        </Table>
        </Form>
        </TableContainer>
        </>
    );
}
