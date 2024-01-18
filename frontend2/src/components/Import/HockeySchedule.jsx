import { Form } from "react-router-dom";
import { UrlGet, UrlApiHockeyImportUrl, GetPostOptions } from "../URLs.jsx";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

export async function action({ request, params }) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  const data = updates.url;

  const body = {
    Data: data,
  };

  const opts = GetPostOptions(JSON.stringify(body));
  await fetch(UrlGet(UrlApiHockeyImportUrl), opts);

  return null;
}

export default function HockeySchedule() {
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
