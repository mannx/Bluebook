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

import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

export async function loader() {
  const resp = await fetch(UrlGet(UrlApiSettingsGet));
  const data = await resp.json();

  return { data };
}

export async function action({ request, params }) {
  const formData = await request.formData(); // get the data from the form
  const updates = Object.fromEntries(formData); // pull everything into an object (otherwise use formData.get(...))

  const body = {
    HockeyURL: updates.hockey_url,
    DisplayHockey: updates.display === "on",
    PrintHockey: updates.print === "on",
  };

  const opt = GetPostOptions(JSON.stringify(body));
  const resp = await fetch(UrlGet(UrlApiSettingsSet), opt);

  return null;
}

export default function Settings() {
  const { data } = useLoaderData();

  const [state, setState] = React.useState({
    display: data.DisplayHockey,
    print: data.PrintHockey,
  });

  const handleChange = (e) => {
    setState({
      ...state,
      [event.target.name]: event.target.checked,
    });
  };

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
        <Stack>
          <TextField
            label="Hockey Schedule URL"
            name="hockey_url"
            defaultValue={data.HockeyURL}
          />
          <FormControlLabel
            control={
              <Switch
                checked={state.display}
                onChange={handleChange}
                name="display"
              />
            }
            label="Display Hockey Data"
          />

          <FormControlLabel
            control={
              <Switch
                checked={state.print}
                onChange={handleChange}
                name="print"
              />
            }
            label="Print Hockey Data"
          />
        </Stack>
      </Form>
    </>
  );
}
