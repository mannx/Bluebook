import {Link, Outlet, useLoaderData} from "react-router-dom";

import Grid from '@mui/material/Unstable_Grid2';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import {
    UrlGet,
    UrlApiGetTags,
    UrlApiGetTagId,
} from "../URLs";

export async function loader() {
    // retrieve all the tags
    const url = UrlGet(UrlApiGetTags);
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

export default function Tags() {
    const {data} = useLoaderData();

    return (<>
        <fieldset><legend>Tags</legend>
        <Grid container spacing={1}>
        {data !== null && data.map( (obj) => {
           return (
               <Grid xs={2} key={obj.ID}>
               <Link to={"/tags/" + obj.ID}>
               <Button size="small" variant="outlined">{obj.Tag} ({obj.TagCount})</Button>
               </Link>
               </Grid>
           );
        }
        )}
        </Grid>
        </fieldset>
        <Outlet/>
        </>);
}

// load information for a given tag with 'id'
export async function idLoader({params}) {
    const url = UrlGet(UrlApiGetTagId) + "?id=" + params.id;
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

export function TagID() {
    const {data} = useLoaderData();

    return (<>
        <TableContainer component={Paper}>
        <Table size="small" sx={{width: 1/2}}>
        <TableHead>
        <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Net Sales</TableCell>
            <TableCell>Comments</TableCell>
            <TableCell>Tags</TableCell>
        </TableRow></TableHead>

        <TableBody>
        {data !== null && data.map( (obj, i) => {
            return (<TableRow key={i}>
                <TableCell>{obj.Day.ID}</TableCell>
                <TableCell>{dayLink(obj.Date)}</TableCell>
                <TableCell>{obj.Day.NetSales}</TableCell>
                <TableCell>{obj.Day.Comment}</TableCell>
                <TableCell>{tagList(obj)}</TableCell>
                </TableRow>
            );
        })}
        </TableBody>

        </Table>
        </TableContainer>
        </>
    );
}

// generate a user friendly linkable list of tags for a given day
function tagList(obj) {
    if(!obj.Tags) return null;

    const out = obj.Tags.map( (o, i) => {
        return (
            <Link to={"/tags/"+obj.TagIDs[i]}>#{o}</Link>
        );
    });
    return out;
}

// create a link to the month for this day
export function dayLink(obj) {
    const date = new Date(obj);
    return <Link to={"/"+(date.getMonth()+1)+"/"+date.getFullYear()}>{obj}</Link>;
}
