import * as React from "react";
import { useLoaderData, Form } from "react-router-dom";
import {
  GetPostOptions,
  UrlApiSettingsGet,
  UrlApiSettingsSet,
  UrlApiManualArchive,
  UrlApiMigrateTags,
} from "../URLs.jsx";

// import HockeyParse from "../Hockey/HockeyParse.tsx";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { Typography } from "@mui/material";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import { ApiReturnMessage } from "../api.tsx";

export async function loader() {
  const resp = await fetch(UrlApiSettingsGet);
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
    HockeyHomeTeam: updates.home_team,
    ManagerName: updates.managerName,
    StoreNumber: updates.storeNumber,
    use_drive: updates.use_drive === "on",
  };

  const opt = GetPostOptions(JSON.stringify(body));
  await fetch(UrlApiSettingsSet, opt);

  return null;
}

export default function Settings() {
  const { data } = useLoaderData();

  const [state, setState] = React.useState({
    display: data.DisplayHockey,
    print: data.PrintHockey,
    hockey_url: data.HockeyURL,
    home_team: data.HockeyHomeTeam,
    managerName: data.ManagerName,
    storeNumber: data.StoreNumber,
    use_drive: data.use_drive,
  });

  const [manualURL, setManualURL] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState(null);

  const [migrateOpen, setMigrateOpen] = React.useState(false);
  const [migrateMsg, setMigrateMsg] = React.useState([]);
  const [migrateShow, setMigrateShow] = React.useState(false);

  const handleChange = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.checked,
    });
  };

  const manualFetch = async (url) => {
    // await HockeyParse(url);
    console.log("TODO: manual hockey fetch not implemeneted");
  };

  const manualArchive = async () => {
    const resp = await fetch(UrlApiManualArchive);
    const json = await resp.json();
    console.log(json);

    if (json.Error !== undefined) {
      if (json.Error === true) {
        setErrorMsg(json.Message);
      } else {
        setErrorMsg(null);
      }
    } else {
      // misformed return data?
      setErrorMsg("Unknown return information");
    }
  };

  const migrateOnOpen = () => {
    setMigrateOpen(true);
  };

  const migrateOnClose = () => {
    setMigrateOpen(false);
  };

  const migrateTags = async () => {
    // close the dialog

    // post the request and save the result
    const opts = GetPostOptions(null);
    const resp = await fetch(UrlApiMigrateTags, opts);
    const json: ApiReturnMessage<string[]> = await resp.json();

    console.log(json);
    if (json.Error === true) {
      setErrorMsg(json.Message);
    } else {
      setMigrateMsg(json.Data);
      setMigrateShow(true);
    }

    // close the dialog
    setMigrateOpen(false);
  };

  return (
    <>
      <h3>Settings</h3>

      <Box>
        <Typography sx={{ color: "red" }}>{errorMsg}</Typography>
      </Box>

      <Box>
        <TextField
          label="Manual Hockey Fetch URL"
          onChange={(e) => setManualURL(e.target.value)}
          value={manualURL}
        />
        <Button
          onClick={() => {
            manualFetch(manualURL);
          }}
        >
          Manual Fetch
        </Button>
      </Box>
      <Divider />

      <Form method="post">
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Hockey Schedule URL"
              name="hockey_url"
              value={state.hockey_url}
              onChange={(e) => {
                setState({ ...state, hockey_url: e.target.value });
              }}
            />
            <Button
              onClick={() => {
                manualFetch(state.hockey_url);
              }}
            >
              Fetch
            </Button>
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              id="managerName"
              name="managerName"
              label="Name Here"
              value={state.managerName}
              onChange={(e) => {
                setState({ ...state, managerName: e.target.value });
              }}
            />
            <TextField
              id="storeNumber"
              name="storeNumber"
              label="Store Number Here"
              value={state.storeNumber}
              onChange={(e) => {
                setState({ ...state, storeNumber: e.target.value });
              }}
            />
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={state.use_drive}
                onChange={(e) => {
                  setState({ ...state, use_drive: e.target.value });
                }}
                name="use_drive"
              />
            }
            label="Use Google Drive?"
          />

          <TextField
            label="Home Hockey Team"
            name="home_team"
            value={state.home_team}
            onChange={(e) => {
              setState({ ...state, home_team: e.target.value });
            }}
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

          <Stack direction="row" spacing={2}>
            <Button variant="contained" type="submit">
              Update
            </Button>
          </Stack>

          <Button onClick={manualArchive}>Create backup archive</Button>
        </Stack>
      </Form>
      <Divider />

      <Box>
        <Typography>Migrate Tags</Typography>
        <Button onClick={setMigrateOpen}>Migrate</Button>
        <Dialog open={migrateOpen} onClose={migrateOnClose}>
          <DialogTitle>Migrate Tags?</DialogTitle>
          <DialogContent>
            <Typography>Migrate tags from old system to new?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={migrateOnClose}>Cancel</Button>
            <Button onClick={migrateTags} autoFocus>
              Migrate
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={migrateShow}
          onClose={() => {
            setMigrateShow(false);
          }}
        >
          <DialogTitle>Migration Results</DialogTitle>
          <DialogContent>
            <ul>
              {migrateMsg.map((n) => {
                return <li>{n}</li>;
              })}
            </ul>
            <Button
              onClick={() => {
                setMigrateShow(false);
              }}
            >
              Ok
            </Button>
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
}
