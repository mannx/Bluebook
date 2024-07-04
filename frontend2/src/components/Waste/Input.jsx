// Input.jsx is used to entry wastage entries to be later combined and shown with Wastage.jsx

import * as React from "react";
import { Form, useLoaderData, useNavigate, redirect } from "react-router-dom";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import Autocomplete from "@mui/material/Autocomplete";

import {
  UrlGet,
  UrlApiWasteNames,
  UrlApiWasteHolding,
  UrlApiWasteHoldingAdd,
  UrlApiWasteHoldingConfirm,
  UrlApiWasteHoldingDelete,
  GetPostOptions,
} from "../URLs";

import ConversionCalculatorInput from "./ConversionCalculator";
import PortionConverter from "./PortionConverter";

// load the current waste data in the holding table, the waste names for autocomplete
export async function loader({ params }) {
  // retrieve all wastage item names
  const nameUrls = UrlGet(UrlApiWasteNames);
  const namesResp = await fetch(nameUrls);
  const names = {
    Names: await namesResp.json(),
  };

  // retrieve all items currently in the wastage holding table
  const holdUrls = UrlGet(UrlApiWasteHolding);
  const holdResp = await fetch(holdUrls);
  const holding = {
    Holding: await holdResp.json(),
  };

  return {
    ...params,
    ...names,
    ...holding,
  };
}

export async function action({ request }) {
  // add the item to the holding db
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  const opt = GetPostOptions(JSON.stringify(updates));
  await fetch(UrlGet(UrlApiWasteHoldingAdd), opt);

  return redirect("/waste/input");
}

export default function WasteInput() {
  const [wasteDate, setWasteDate] = React.useState(null);
  const [confirm, setConfirm] = React.useState(false);
  const [portionValue, setPortionValue] = React.useState(0);

  const [textInput, setTextInput] = React.useState(0);
  const handleTextInput = (e) => {
    setTextInput(e.target.value);
  };

  const navigate = useNavigate();
  const data = useLoaderData();

  // button handler for removing an item
  const deleteItem = async (id) => {
    const url = UrlGet(UrlApiWasteHoldingDelete);
    const body = {
      ID: id,
    };

    const opts = GetPostOptions(JSON.stringify(body));
    await fetch(url, opts);
  };

  // handlers for showing and hiding the confirmation dialog box
  const handleConfirmOpen = () => {
    setConfirm(true);
  };
  const handleConfirmClose = () => {
    setConfirm(false);
  };

  const confirmBtn = async () => {
    const url = UrlGet(UrlApiWasteHoldingConfirm);
    const opts = GetPostOptions("");
    await fetch(url, opts);

    handleConfirmClose();
  };

  // when we click copy from the conversion calculator, copy this value into the current input field
  const copyCallback = (n) => {
    setTextInput(n);
  };

  const portionCallback = (n) => {
    // copy this value to the input conversion value
    setPortionValue(n);
  };

  return (
    <>
      <Container>
        <h3>Waste Input</h3>
        <Button variant="contained" onClick={handleConfirmOpen}>
          Submit
        </Button>
      </Container>

      <Stack spacing={2}>
        <ConversionCalculatorInput
          callback={copyCallback}
          useCallback
          defaultInput={portionValue}
        />
        <PortionConverter
          callback={portionCallback}
          buttonText="Copy To Converter"
        />
      </Stack>

      <TableContainer component={Paper}>
        <Form method="post">
          <Table size="small">
            <TableHead>
              <TableRow>
                <th className="Month">Date</th>
                <th className="Month">Item</th>
                <th className="Month">Quantity</th>
                <th className="Month">Reason</th>
                <th className="Month"></th>
              </TableRow>
            </TableHead>

            <TableBody>
              <TableRow>
                <TableCell>
                  <DatePicker
                    value={wasteDate}
                    onChange={(e) => setWasteDate(e)}
                  />
                  {wasteDate !== null && (
                    <input
                      type="hidden"
                      name="Date"
                      value={wasteDate.format("MM-DD-YYYY")}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Autocomplete
                    autoSelect
                    autoHighlight
                    id="freeSolo"
                    options={data.Names.map((n) => n)}
                    renderInput={(params) => (
                      <TextField
                        autoFocus
                        {...params}
                        label="Name"
                        name="Name"
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Quantity"
                    type="number"
                    variant="standard"
                    name="Quantity"
                    inputProps={{
                      step: "any",
                      inputMode: "numeric",
                      pattern: "[0-9](.[0-9]*)?",
                    }}
                    value={textInput}
                    onChange={handleTextInput}
                  />
                </TableCell>
                <TableCell>
                  <TextField label="Reason" variant="standard" name="Reason" />
                </TableCell>
                <TableCell>
                  <Button type="submit">Add</Button>
                </TableCell>
              </TableRow>

              {data.Holding !== null &&
                data.Holding.map((obj) => {
                  return (
                    <TableRow>
                      <TableCell>
                        {obj.Month}/{obj.Day}/{obj.Year}
                      </TableCell>
                      <TableCell>{obj.Name}</TableCell>
                      <TableCell>{obj.Quantity}</TableCell>
                      <TableCell>{obj.Reason}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => {
                            deleteItem(obj.ID);
                            navigate("/waste/input");
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </Form>
      </TableContainer>

      <Dialog open={confirm} onClose={handleConfirmClose}>
        <DialogTitle>Confirm wastage entries?</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Confirm merge of wastage entries from holding table?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleConfirmClose}>Disagree</Button>
          <Button
            onClick={() => {
              confirmBtn();
              navigate("/wastage");
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
