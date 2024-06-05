// Settings.jsx is used to configure wastage entries in the database
import * as React from "react";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  redirect,
} from "react-router-dom";

import TextField from "@mui/material/TextField";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Checkbox from "@mui/material/Checkbox";

import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";

import { Typography } from "@mui/material";
import { Container } from "@mui/material";

import {
  GetPostOptions,
  UrlGet,
  UrlApiWasteSettingsGet,
  UrlApiWasteRemoveUnused,
  UrlApiWasteItem,
  UrlApiWasteItemUpdate,
  UrlApiWasteItemNew,
} from "../URLs";

export async function loader() {
  const url = UrlGet(UrlApiWasteSettingsGet);
  const resp = await fetch(url);
  const data = await resp.json();

  return { data };
}

export async function action({ request }) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  return null;
}

function genState(len) {
  let arr = [];

  for (let i = 0; i < len; i++) {
    arr.push(false);
  }

  return arr;
}

export default function WasteSettings() {
  const { data } = useLoaderData();
  const navigate = useNavigate();

  const [serverMessage, setServerMessage] = React.useState(null);
  const [combined, setCombined] = React.useState(genState(data.Data.length));

  const removeUnused = async () => {
    const url = UrlGet(UrlApiWasteRemoveUnused);

    const resp = await fetch(url);
    const json = await resp.json();

    setServerMessage(json);
  };

  const addNew = async () => {
    const url = UrlGet(UrlApiWasteItemNew);
    const opt = GetPostOptions(null);
    const resp = await fetch(url, opt);
    const json = await resp.json();

    // redirect to the edit view
    navigate(`/waste/settings/${json.ID}`);
  };

  const onCombine = async () => {};

  const onCombineChange = (i) => {
    let n = combined;
    n[i] = !n[i];
    setCombined(n);
  };

  const displayMessage = () => {
    if (serverMessage === null) {
      return <></>;
    }

    let css = {};

    if (serverMessage !== null && serverMessage.Error === true) {
      css = { color: "red" };
    }

    return <Typography sx={css}>{serverMessage.Message}</Typography>;
  };

  return (
    <>
      <Form method="post" id="form-data">
        <Stack spacing={2} direction="row">
          <Button variant="contained" onClick={addNew}>
            New
          </Button>
          <Button variant="contained" onClick={removeUnused}>
            Remove Unused
          </Button>
          <Button variant="contained" type="submit" onClick={onCombine}>
            Combine
          </Button>
        </Stack>

        <Container>{displayMessage()}</Container>
        <TableContainer component={Paper}>
          <Table size="small" sx={{ width: 1 / 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Edit</TableCell>
                <TableCell></TableCell>
                <TableCell>Count</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Conversion</TableCell>
                <TableCell>Unit Weight</TableCell>
                <TableCell>Pack Size</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data !== null &&
                data.Data.map((obj, i) => {
                  return (
                    <TableRow key={i}>
                      <TableCell>
                        <Link to={"/waste/settings/" + obj.ID}>
                          <Button>Edit</Button>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          name={"cb" + i}
                          value={obj.ID}
                          checked={combined[i]}
                          onChange={() => {
                            onCombineChange(i);
                          }}
                        />
                      </TableCell>
                      <TableCell>{data.Counts[i]}</TableCell>
                      <TableCell>{obj.Name}</TableCell>
                      <TableCell>{obj.UnitString}</TableCell>
                      <TableCell>{obj.LocationString}</TableCell>
                      <TableCell>
                        {obj.CustomConversion === true ? "True" : "False"}
                      </TableCell>
                      {obj.CustomConversion === true ? (
                        <TableCell>{obj.UnitWeight}</TableCell>
                      ) : (
                        <TableCell></TableCell>
                      )}
                      <TableCell>{obj.PackSize}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Form>
    </>
  );
}

export async function EditLoader({ params }) {
  const url = UrlGet(UrlApiWasteItem) + "?id=" + params.id;
  const resp = await fetch(url);
  const data = await resp.json();

  return { data };
}

export async function EditAction({ request, params }) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  const id = parseInt(params.id);

  // build the update body
  const body = {
    ID: id,
    Unit: parseInt(updates.Unit),
    HasCustom: updates.custom !== undefined,
    Conversion:
      updates.conversion === undefined ? 0.0 : parseFloat(updates.conversion),
    Name: updates.Name,
    Location: parseInt(updates.Location),
    PackSize: parseFloat(updates.packsize),
    PackSizeUnit: parseInt(updates.PackSizeUnit),
  };

  const opt = GetPostOptions(JSON.stringify(body));
  await fetch(UrlGet(UrlApiWasteItemUpdate), opt);

  return redirect("/waste/settings/");
}

export function WasteSettingsEdit() {
  const { data } = useLoaderData();
  const navigate = useNavigate();

  const [unit, setUnit] = React.useState(data.Item.UnitMeasure);
  const [location, setLocation] = React.useState(data.Item.Location);
  const [checked, setChecked] = React.useState(data.Item.CustomConversion);
  const [packSize, setPackSize] = React.useState(data.Item.PackSizeUnit);

  const updateUnit = (e) => {
    setUnit(e.target.value);
  };

  const updateLocation = (e) => {
    setLocation(e.target.value);
  };

  const updatePackSize = (e) => {
    setPackSize(e.target.value);
  };

  const unitKeys = Object.keys(data.Units);
  const locations = Object.keys(data.Locations);

  return (
    <>
      <h1>Edit {data.Item.Name}</h1>
      <Form method="post">
        <Stack spacing={2} direction="row">
          <Button variant="contained" type="submit">
            Save
          </Button>
          <Button variant="contained" onClick={() => navigate(-1)}>
            Back
          </Button>
        </Stack>
        Unit Measure
        <TableContainer component={Paper} sx={{ width: 0.75 }}>
          <Table size="small">
            <TableHead></TableHead>

            <TableBody>
              <TableRow>
                <TableCell>Wastage Counts</TableCell>
                <TableCell>{data.Count}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>
                  <TextField defaultValue={data.Item.Name} name="Name" />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Unit Measure</TableCell>
                <TableCell>
                  <InputLabel id="unit">Unit</InputLabel>
                  <Select
                    labelId="unit"
                    name="Unit"
                    label="Unit"
                    value={unit}
                    onChange={updateUnit}
                  >
                    {unitKeys.map((u) => {
                      return (
                        <MenuItem key={u} value={u}>
                          {data.Units[u]}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Location</TableCell>
                <TableCell>
                  <InputLabel id="Location">Location</InputLabel>
                  <Select
                    labelId="Location"
                    name="Location"
                    label="Loc"
                    value={location}
                    onChange={updateLocation}
                  >
                    {locations.map((i) => {
                      return (
                        <MenuItem key={i} value={i}>
                          {data.Locations[i]}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Custom Conversion</TableCell>
                <TableCell>
                  <Checkbox
                    name="custom"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Conversion"
                    type="number"
                    variant="standard"
                    name="conversion"
                    inputProps={{ step: "any" }}
                    defaultValue={data.Item.UnitWeight}
                  />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Pack Size</TableCell>
                <TableCell>
                  <TextField
                    label="Pack Size"
                    type="number"
                    variant="standard"
                    name="packsize"
                    inputProps={{ step: "any" }}
                    defaultValue={data.Item.PackSize}
                  />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Pack Size Measurement</TableCell>
                <TableCell>
                  <InputLabel id="unit">Unit</InputLabel>
                  <Select
                    labelId="unit"
                    name="PackSizeUnit"
                    label="Unit"
                    value={packSize}
                    onChange={updatePackSize}
                  >
                    {unitKeys.map((u) => {
                      // skip Pack unit size
                      if (data.Units[u] === "Pack") {
                        return;
                      }

                      return (
                        <MenuItem key={u} value={u}>
                          {data.Units[u]}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Form>
    </>
  );
}
