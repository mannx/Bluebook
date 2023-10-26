import * as react from 'react';
import {Form, useLoaderData} from "react-router-dom";

import Button from '@mui/material/Button';

import {UrlGet, UrlApiDailyUndo } from "../URLs";

// retrieve the list of backup days we have available
export async function loader(){
    const url = UrlGet(UrlApiDailyUndo);
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

export default function Settings() {
    const {data}=useLoaderData();

    return (<>
        <h3>Daily Data Undo</h3>
        <Button variant="contained" type="submit">Undo</Button>
        <table className="month">
            <caption><h4>Daily Undo <Button varianet="contained" type="submit">Undo</Button></h4></caption>
            <thead>
                <tr>
                    <th>Date</th>
                </tr>
            </thead>

            <tbody>
                {data.map( (o) => {
                    return (<tr>
                        <td>{o.Date}</td>
                    </tr>);
                })}
            </tbody>
        </table>
        </>);
}