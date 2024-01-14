import * as React from "react";
import { useLoaderData, Form } from "react-router-dom";
import {
  UrlGet,
  GetPostOptions,
  UrlApiSettingsGet,
  UrlApiSettingsSet,
} from "../URLs.jsx";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

export async function loader() {
  const resp = await fetch(UrlGet(UrlApiSettingsGet));
  const data = await resp.json();
  // console.log(data);

  return { data };
}

export async function action({ request, params }) {
  const formData = await request.formData(); // get the data from the form
  const updates = Object.fromEntries(formData); // pull everything into an object (otherwise use formData.get(...))

  const body = {
    HockeyURL: updates.hockey_url,
  };

  const opt = GetPostOptions(JSON.stringify(body));
  const resp = await fetch(UrlGet(UrlApiSettingsSet), opt);
  console.log(resp);

  return null;
}

export default function Settings() {
  const { data } = useLoaderData();

  return (
    <>
      <h3>Settings</h3>
      <Form method="post">
        <Stack direction="row" spacing={2}>
          <Button variant="contained" type="submit">
            Update
          </Button>
        </Stack>
        <br />
        <Box>
          Hockey Schedule URL:{" "}
          <TextField
            label="Hockey Schedule URL"
            name="hockey_url"
            defaultValue={data.HockeyURL}
          />
        </Box>
      </Form>
    </>
  );
}
