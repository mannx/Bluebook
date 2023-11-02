import * as react from 'react';
import {Form, useLoaderData} from "react-router-dom";
import Button from '@mui/material/Button';

import {UrlGet, UrlApiDailyUndoList, UrlApiDailyUndoAction, GetPostOptions} from "../URLs";

// retrieve the list of backup days we have available
export async function loader(){
    const url = UrlGet(UrlApiDailyUndoList);
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

export async function action({request}){
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);

    // flatten the object into an array of file names
    // each file name has a numeric key starting at 0
    const ids = Object.keys(updates).map( (o) => {
        return updates[o];
    }).filter( (o) => o !== undefined);

    const url = UrlGet(UrlApiDailyUndoAction);
    const opt = GetPostOptions(JSON.stringify(ids));

    await fetch(url, opt);

    return null;
}

export default function Settings() {
    const {data}=useLoaderData();

    return (<>
        <h3 style={{color: "red"}}>CAUTION: Not fully tested</h3>
        <Form method="post">
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
                    const dateStr = o.Date.slice(0,o.Date.length-10);

                    return (<tr>
                        <td><input type="checkbox" name={"id-" + o.ID} value={o.ID}/></td>
                        <td>{dateStr}</td>
                    </tr>);
                })}
            </tbody>
        </table>
        </Form>
        </>);
}