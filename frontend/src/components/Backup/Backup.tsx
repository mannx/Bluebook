import * as React from "react";
import {
  useLoaderData,
  useActionData,
  redirect,
  Link,
  Form,
} from "react-router-dom";

import {
  UrlApiBackupGet,
  UrlApiBackupUndo,
  UrlApiBackupClear,
  GetPostOptions,
} from "../URLs.jsx";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import { ApiReturnMessage } from "../api.tsx";

export async function loader({ params }) {
  const resp = await fetch(UrlApiBackupGet);
  const data = await resp.json();

  return data;
}

export async function action({ request }) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  // convert the selected id's into an array of ints
  const ids = Object.keys(updates).map((n) => parseInt(n));

  const opt = GetPostOptions(JSON.stringify(ids));
  const resp = await fetch(UrlApiBackupUndo, opt);
  const data = await resp.json();

  return data;
}

export default function Backup() {
  const data = useLoaderData();
  const action = useActionData();

  const [confirmClear, setConfirmClear] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [clearResultShow, setClearResultShow] = React.useState(false);
  const [clearResult, setClearResult] = React.useState("");

  const [lastCleared, setLastCleared] = React.useState(0);

  const messages = () => {
    if (action === undefined) return <></>;

    return (
      <ul>
        {action.map((n) => {
          return <li>{n}</li>;
        })}
      </ul>
    );
  };

  const clearBackupList = async () => {
    // post the request and save the result
    const opts = GetPostOptions(null);
    const resp = await fetch(UrlApiBackupClear, opts);
    const json: ApiReturnMessage<string[]> = await resp.json();

    console.log(json);
    if (json.Error === true) {
      setErrorMsg(json.Message);
    } else {
      setClearResult(json.Data);
      setLastCleared(json.Data);
    }

    // close the dialog
    setConfirmClear(false);
    setClearResultShow(true);
  };

  return (
    <>
      <Box padding={2}>
        Last Cleared: {lastCleared}
        <Button
          variant="contained"
          onClick={() => {
            setConfirmClear(true);
          }}
        >
          Clear List
        </Button>
      </Box>
      <Form method="post">
        <Button variant="contained" type="submit">
          Undo
        </Button>

        {messages}
        <table>
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((obj) => {
              return (
                <tr>
                  <td>
                    <input type="checkbox" name={obj.id} />
                  </td>
                  <td>{obj.id}</td>
                  <td>{obj.DayDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Form>

      <Dialog
        open={confirmClear}
        onClose={() => {
          setConfirmClear(false);
        }}
      >
        <DialogTitle>Clear Undo List?</DialogTitle>
        <DialogContent>
          <Typography>Clear undo list (Cannot be undone.)?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmClear(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              clearBackupList();
            }}
            autoFocus
          >
            Clear
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={clearResultShow}
        onClose={() => {
          setClearResultShow(false);
        }}
      >
        <DialogContent>
          {clearResult}
          <Button
            onClick={() => {
              setClearResultShow(false);
            }}
          >
            Ok
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
