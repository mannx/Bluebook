// Settings.jsx is used to configure wastage entries in the database
import * as React from "react";
import {Link, Outlet, useLoaderData } from "react-router-dom";

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

import { Typography } from '@mui/material';
import { Container } from '@mui/material';

import {
    UrlGet,
    UrlApiWasteSettingsGet,
    UrlApiWasteRemoveUnused,
    UrlApiWasteItem,
} from "../URLs";

export async function loader() {
    const url = UrlGet(UrlApiWasteSettingsGet);
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

export default function WasteSettings() {
    const {data} = useLoaderData();

    const [serverMessage, setServerMessage] = React.useState(null);

    const removeUnused = async () => {
        const url = UrlGet(UrlApiWasteRemoveUnused);

        const resp = await fetch(url);
        const json = await resp.json();

        setServerMessage(json);
    }

    const displayMessage = () => {
        if(serverMessage === null) {
            return <></>;
        }

        let css = "";

        if(serverMessage !== null && serverMessage.Error === true) {
            css = {color: "red"};
        }

        console.log(css);
        return (
            <Typography sx={css}>{serverMessage.Message}</Typography>
        );
    }

    return (<>
        <Stack spacing={2} direction="row">
            <Button variant="contained">New</Button>
            <Button variant="contained">Combine</Button>
            <Button variant="contained">Delete</Button>
            <Button variant="contained" onClick={removeUnused}>Remove Unused</Button>
        </Stack>

        <Container>
        {displayMessage()}
        </Container>
        <TableContainer component={Paper}>
        <Table size="small" sx={{width: 1/2}}>

        <TableHead>
            <TableRow>
                <TableCell>Edit</TableCell>
                <TableCell></TableCell>
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
                <TableCell>
                    <Link to={"/waste/settings/"+obj.ID}>
                    <Button>Edit</Button>
                    </Link>
                </TableCell>
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

export async function EditLoader({params}) {
    const url = UrlGet(UrlApiWasteItem) + "?id=" + params.id;
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

export function WasteSettingsEdit() {
    const {data} = useLoaderData();

    return (
        <h1>Edit {data.Item.Name}</h1>
    );
}
