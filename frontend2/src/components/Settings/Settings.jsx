import * as react from 'react';
import {Form, useLoaderData} from "react-router-dom";
import Button from '@mui/material/Button';

import {UrlGet, UrlApiDailyUndo } from "../URLs";

import dayjs from 'dayjs';


// retrieve the list of backup days we have available
export async function loader(){
    const url = UrlGet(UrlApiDailyUndo);
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

export async function action({request}){
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);

    console.log(updates);

    // flatten the object into an array of file names
    // each file name has a numeric key starting at 0
    const ids = Object.keys(updates).map( (o) => {
        return updates[o];
    }).filter( (o) => o !== undefined);

    console.log(ids);
    return null;
}

export default function Settings() {
    const {data}=useLoaderData();

    return (<>
        <h3>Daily Data Undo</h3>
        <Form method="post">
        <Button variant="contained" type="submit">Undo</Button>
        <table className="month">
            <caption><h4>Daily Undo <Button variant="contained" type="submit">Undo</Button></h4></caption>
            <thead>
                <tr>
                    <th></th>
                    <th>Date</th>
                </tr>
            </thead>

            <tbody>
                {data.map( (o) => {
                    // remove timezone info to prevent showing a previous day
                    //  (date has UTC timezone and dayjs will shift that to local time)
                    // const dateStr = data.Dates[index].slice(0, data.Dates[index].length-10);
                    const dateStr = o.Date.slice(0,o.Date.length-10);

                    return (<tr>
                        <td><input type="checkbox" name={"id"} value={o.ID}/></td>
                        <td>{dateStr}</td>
                    </tr>);
                })}
            </tbody>
        </table>
        </Form>
        </>);
}