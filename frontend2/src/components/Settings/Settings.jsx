import * as React from "react";
import { useLoaderData, Form } from "react-router-dom";
import {
  UrlGet,
  GetPostOptions,
  UrlApiSettingsGet,
  UrlApiSettingsSet,
  UrlApiHockeyImportUrl,
  UrlApiManualArchive,
} from "../URLs.jsx";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { Typography } from "@mui/material";

import Grid from "@mui/material/Grid";

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
    HockeyHomeTeam: updates.home_team,
    RunHockeyFetch: updates.runHockey === "on",
    ManagerName: updates.manager,
    StoreNumber: updates.storeNumber,
  };

  const opt = GetPostOptions(JSON.stringify(body));
  await fetch(UrlGet(UrlApiSettingsSet), opt);

  return null;
}

export default function Settings() {
  const { data } = useLoaderData();

  const [state, setState] = React.useState({
    display: data.DisplayHockey,
    print: data.PrintHockey,
    hockey_url: data.HockeyURL,
    home_team: data.HockeyHomeTeam,
    runHockey: data.RunHockeyFetch,
    manager: data.ManagerName,
    storeNumber: data.StoreNumber,
  });

  const [manualURL, setManualURL] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState(null);

  const handleChange = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.checked,
    });
  };

  const manualFetch = async (url) => {
    const body = {
      Data: url,
    };

    const opts = GetPostOptions(JSON.stringify(body));
    await fetch(UrlGet(UrlApiHockeyImportUrl), opts);
  };

  const manualArchive = async () => {
    const resp = await fetch(UrlGet(UrlApiManualArchive));
    const json = await resp.json();
    console.log(json);

    if(json.Error!==undefined){
      if(json.Error === true){
        setErrorMsg(json.Message);
      }else{
        setErrorMsg(null);
      }
    }else{
      // misformed return data?
      setErrorMsg("Unknown return information");
    }
  };

  return (
    <>
      <h3>Settings</h3>

      <Box>
        <Typography sx={{color: "red"}} >{errorMsg}</Typography>
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
        <Stack direction="row" spacing={2}>
          <Button variant="contained" type="submit">
            Update
          </Button>
        </Stack>
        <br />

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
            <FormControlLabel control={<Switch name="runHockey" id="runHockey" checked={state.runHockey} onChange={handleChange}/>} label="Run Hockey Scheduler" />
          </Stack>

          <Stack direction="row" spacing={2}>
              <TextField id="managerName" name="managerName" label="Name Here" value={state.managerName} onChange={(e)=>{setState({...state,managerName: e.target.value})}} />
              <TextField id="storeNumber" name="storeNumber" label="Store Number Here" value={state.storeNumber} onChange={(e)=>{setState({...state,storeNumber: e.target.value})}} />
          </Stack>

          <TextField label="Home Hockey Team" name="home_team" value={state.home_team} onChange={(e) => {setState({...state,home_team: e.target.value})}} />

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

          {/* <Grid container spacing={2} >
            <Grid item xs={6}>
              Manager Name: 
            </Grid>
            <Grid item xs={6}>
              <TextField id="managerName" name="managerName" defaultValue="Name Here" value={state.managerName} onChange={(e)=>{setState({...state,managerName: e.target.value})}} />
            </Grid>
          </Grid> */}

          <Button onClick={manualArchive}>Create backup archive</Button>
        </Stack>
      </Form>
    </>
  );
}
