import {UrlGet, UrlApiTestFunction} from "../URLs";
import {Form, redirect, useLoaderData} from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

// async function handleClick() {
//     const resp = await fetch(UrlGet(UrlApiTestFunction));
//     const data = await resp.json();

//     console.log(data);
// }

export async function action({request, params}){
//   const formData = await request.formData(); // get the data from the form
//   const updates = Object.fromEntries(formData); // pull everything into an object (otherwise use formData.get(...))

//   const body = {
//     Query: updates.query,
//   };

//   const opt = GetPostOptions(JSON.stringify(body));
//   const resp = await fetch(UrlGet(UrlApi2RawSql), opt);
  
//   return redirect("/debug");
    return redirect("/debug");
}

export async function loader() {
    // const resp = await fetch(UrlGet(UrlApi2RawSqlResult));
    // const data = await resp.json();

    // return {data};
    return null;
}

export default function DebugPage() {
    const {data} = useLoaderData();

    return (
    <Form>
        <TextField label="Raw SQL to run" name="query"/>
        <Button variant="contained" type="submit">Query</Button>
    </Form>
    )
}