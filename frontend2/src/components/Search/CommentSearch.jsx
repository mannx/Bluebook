import {Form, useLoaderData, redirect, Link} from "react-router-dom";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';

import {UrlGet, UrlApiCommentSearch} from '../URLs';

// load our search results if we have any
export async function loader({request}) {
    console.log("loader");
    const url1 = new URL(request.url);
    const search = url1.searchParams.get("q");

    if(search === null || search === undefined){
        // no search term was provided, return nothing
        return null;
    }

    // console.log(search);

    const url = UrlGet(UrlApiCommentSearch) + "?" + url1.searchParams;
    console.log("url1: " + url1.searchParams);

    console.log("Getting search results...url: " + url);
    return null;

    // SKIPPING UNTIL BACKEND PORTION IMPLEMENTED
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

export default function CommentSearch(){
    return(
        <>
        <h3>Comment Search</h3>
        <Form method="get">
            <Container maxWidth="sm">
                <TextField name="q" label="Search Field" type="search" variant="standard" />
                <Button variant="contained" type="submit">Search</Button>
            </Container>

            <div>
                <p>Search Results Here</p>
            </div>
        </Form>
        </>
    )
}