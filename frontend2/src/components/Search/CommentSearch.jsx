import {Form, useLoaderData, Link} from "react-router-dom";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import {UrlGet, UrlApiCommentSearch} from '../URLs';

// load our search results if we have any
export async function loader({request}) {
    const url1 = new URL(request.url);
    const search = url1.searchParams.get("q");

    if(search === null || search === undefined){
        // no search term was provided, return nothing
        return {};
    }

    const url = UrlGet(UrlApiCommentSearch) + "?" + url1.searchParams;
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

export default function CommentSearch(){
    const {data} = useLoaderData();
    console.log(data);

    let table = <></>;
    if(data !== null && data !== undefined){
        table = DisplayComments(data);
    }

    return(
        <>
        <h3>Comment Search</h3>
        <Form method="get">
            <Container maxWidth="sm">
                <TextField name="q" label="Search Field" type="search" variant="standard" />
                <Button variant="contained" type="submit">Search</Button>
            </Container>

            <div>
                {table}
            </div>
        </Form>
        </>
    )
}

function DisplayComments(data) {
    return (<>
        <TableContainer component={Paper}>
        <Table size="small" sx={{width: 1/2}}>
        <TableHead>
        <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Net Sales</TableCell>
            <TableCell>Comments</TableCell>
        </TableRow></TableHead>

        <TableBody>
        {data !== null && data.map( (obj, i) => {
            return (<TableRow key={i}>
                <TableCell>{obj.Day.ID}</TableCell>
                <TableCell>{dayLink(obj.Date)}</TableCell>
                <TableCell>{obj.Day.NetSales}</TableCell>
                <TableCell>{obj.Day.Comment}</TableCell>
                </TableRow>
            );
        })}
        </TableBody>

        </Table>
        </TableContainer>
        </>
    );
}

// create a link to the month for this day
function dayLink(obj) {
    const date = new Date(obj);
    return <Link to={"/"+(date.getMonth()+1)+"/"+date.getFullYear()}>{obj}</Link>;
}
