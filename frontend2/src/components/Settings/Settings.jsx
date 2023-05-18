import * as react from 'react';
import {Form, useLoaderData} from "react-router-dom";

import Button from '@mui/material/Button';

import {UrlGet, UrlApiDailyUndo, UrlApiDailyRevert, UrlApiGetBackupTable} from "../URLs";

// retrieve the list of backup days we have available
export async function loader() {
    const url = UrlGet(UrlApiDailyUndo);
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

export async function action({request, params}) {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);
    const table = updates.table;

    let url = "";
    if(table === "undo") {
        url = UrlGet(UrlApiDailyUndo);
    }else{
        url = UrlGet(UrlApiDailyRevert);
    }

    console.log(url);
    return null;
}

export default function Settings() {
    const {data}=useLoaderData();

    return (<>
        <h3>Daily Data Undo</h3>
        <Button variant="contained" type="submit">Undo</Button>
        <Imports title="Import Revert List" prefix="revert" data={data.List} />
        <Imports title="Daily Data Undo List" prefix="undo" data={data.Backup} />
        </>);
}

// <Imports title="Title" data={data[]} callback=() />
function Imports(props) {
    const id = (i) => {
        return i.EntryID === undefined ? i.ID : i.EntryID;
    }

    const item = (i) => {
        return i.Item === undefined ? i : i.Item;
    }

    return (
        <Form method="post">
        <input type="hidden" name="table" value={props.prefix} />
        <table className="Month">
        <caption><h4>{props.title}<Button variant="contained" type="submit">Revert</Button></h4></caption>
        <thead>
        <tr >
        <th></th>
        <th>ID</th>
        <th>Date</th>
        </tr>
        </thead>

        <tbody>
        {props.data.map( (obj) => {
            return <tr>
                <td><input type="checkbox" name={id(obj)} /></td>
                <td>{id(obj)}</td>
                <td>{item(obj).DateString}</td>
                </tr>;
        })}
        </tbody>
        </table>
        </Form>
    );
}
