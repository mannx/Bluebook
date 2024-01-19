import {UrlGet, UrlApiTestFunction, UrlApi2RawSql, UrlApi2RawSqlResult, GetPostOptions} from "../URLs";
import {Form, redirect, useLoaderData} from "react-router-dom";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

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
    // const {data} = useLoaderData();

    // let msg = <></>;
    // if(data.Error !== undefined){
    //     msg = <span>{data.Error === true ? "Error" : "Message"}: {data.Message}</span>;
    // }else{
    //     msg = GenOutput(data);
    // }

    // return (<>
    // <Form method="post">
    //     <TextField label="Raw SQL to run" name="query"/>
    //     <Button variant="contained" type="submit">Query</Button>
    // </Form>
    // <Box>
    //     {msg}
    // </Box>
    // </>)
    return <span>todo</span> 
}

// function GenOutput(raw) { const data = JSON.parse(raw.Result);

//     return (<>
//         <TableContainer component={Paper}>
//             <h3>Raw SQL Results</h3>
//             <Table>
//                 <TableHead>
//                     <TableRow>
//                         <TableCell>Date</TableCell>
//                         <TableCell>Net Sales</TableCell>
//                     </TableRow>
//                 </TableHead>
//                 <TableBody>
//                     {data.map( (obj) => {
//                         return <TableRow>
//                             <TableCell>{obj.Date}</TableCell>
//                             <TableCell>{obj.NetSales}</TableCell>
//                         </TableRow>;
//                     })}
//                 </TableBody>
//             </Table>
//         </TableContainer>
//     </>);
// }