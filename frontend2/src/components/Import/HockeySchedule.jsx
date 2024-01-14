import * as react from "react";
import { Form } from "react-router-dom";
// import {UrlGet, UrlApiImportHockeySchedule, GetPostOptions} from "../URLs.jsx";
import { UrlGet, UrlApiHockeyImportUrl, GetPostOptions } from "../URLs.jsx";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export async function action({ request, params }) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  const data = updates.url;

  const body = {
    Data: data,
  };

  const opts = GetPostOptions(JSON.stringify(body));
  const resp = await fetch(UrlGet(UrlApiHockeyImportUrl), opts);

  return null;
}

export default function HockeySchedule() {
  // return (<>
  //     <h3>Hockey Schedule Importer</h3>
  //     <Form method="post">
  //         <Stack direction="row" spacing={2}>
  //             <Button variant="contained" type="submit">Upload</Button>
  //         </Stack>
  //
  //         <Box sx={{'& .MuiTextField-root': {m: 2, width: '70%'}, }} noValidate autoComplete="off">
  //             <div>
  //                 <TextField label="Schedule Import" name="data" multiline />
  //             </div>
  //         </Box>
  //     </Form>
  //     </>);
  return (
    <>
      <h3>Hockey Schedule Import</h3>
      <Form method="post">
        <Box>
          <TextField label="Manual Import URL" name="url" />
          <Button variant="contained" type="submit">
            Import
          </Button>
        </Box>
      </Form>

      <Form method="post" action="/hockey/"></Form>
    </>
  );
}
