// Settings.jsx is used to configure wastage entries in the database
import {Outlet, useLoaderData } from "react-router-dom";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';

import {
    UrlGet,
    UrlApiWasteSettingsGet,
} from "../URLs";

export async function loader() {
    const url = UrlGet(UrlApiWasteSettingsGet);
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

export default function WasteSettings() {
    const {data} = useLoaderData();

    return (<>
        <Stack spacing={2} direction="row">
            <Button variant="contained">New</Button>
            <Button variant="contained">Combine</Button>
            <Button variant="contained">Delete</Button>
            <Button variant="contained">Remove Unused</Button>
        </Stack>

        <TableContainer component={Paper}>
        <Table size="small" sx={{width: 1/2}}>

        <TableHead>
            <TableRow>
                <TableCell></TableCell>
                <TableCell>Edit</TableCell>
                <TableCell>Count</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Conversion</TableCell>
                <TableCell>Unit Weight</TableCell>
            </TableRow>
        </TableHead>

        <TableBody>
        {data !== null && data.Data.map( (obj, i) => {
            return (
                <TableRow>
                <TableCell><Button>Edit</Button></TableCell>
                <TableCell><Checkbox /></TableCell>
                <TableCell>{data.Counts[i]}</TableCell>
                <TableCell>{obj.Name}</TableCell>
                <TableCell>{obj.UnitString}</TableCell>
                <TableCell>{obj.LocationString}</TableCell>
                <TableCell>{obj.CustomerConversion === true ? "True" : "False"}</TableCell>
                <TableCell>{obj.UnitWeight}</TableCell>
                </TableRow>
            );
        })}

        </TableBody>

        </Table>
        </TableContainer>
        <Outlet/>
        </>);
}

export function WasteSettingsEdit(props) {
    console.log(props);
    return (
        <h1>Edit Waste item</h1>
    );
}
