import * as React from "react";
import { useNavigate, Form, Link, useLoaderData } from "react-router-dom";
import Button from "@mui/material/Button";

import {
  UrlApiDailyUndoList,
  UrlApiDailyUndoAction,
  GetPostOptions,
  UrlApiDailyUndoClear,
} from "../URLs";

// retrieve the list of backup days we have available
export async function loader() {
  const url = UrlApiDailyUndoList;
  const resp = await fetch(url);
  const data = await resp.json();

  return { data };
}

export async function action({ request }) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  // flatten the object into an array of file names
  // each file name has a numeric key starting at 0
  const ids = Object.keys(updates)
    .map((o) => {
      return updates[o];
    })
    .filter((o) => o !== undefined);

  const url = UrlApiDailyUndoAction;
  const opt = GetPostOptions(JSON.stringify(ids));

  await fetch(url, opt);

  return null;
}

export default function Backups() {
  const { data } = useLoaderData();
  const [errMsg, setErrMsg] = React.useState("");
  const nav = useNavigate();

  const clearBackupTable = async () => {
    setErrMsg("Clearing backup table...");

    const url = UrlApiDailyUndoClear;
    const resp = await fetch(url);
    const json = await resp.json();

    setErrMsg(json.Message);
    nav(0);
  };

  return (
    <>
      <h3>Daily Import Backups</h3>
      <Button variant="contained" onClick={clearBackupTable}>
        Clear Backup Table
      </Button>
      <span>{errMsg}</span>
      <Form method="post">
        <table className="month">
          <caption>
            <h4>
              Daily Undo{" "}
              <Button variant="contained" type="submit">
                Undo
              </Button>
            </h4>
          </caption>
          <thead>
            <tr>
              <th></th>
              <th>Date</th>
              <th>Net Sales</th>
            </tr>
          </thead>

          <tbody>
            {data.map((o) => {
              // remove timezone info to prevent showing a previous day
              //  (date has UTC timezone and dayjs will shift that to local time)
              const dateStr = o.Date.slice(0, o.Date.length - 10);

              return (
                <tr>
                  <td>
                    <input type="checkbox" name={"id-" + o.ID} value={o.ID} />
                  </td>
                  <td>{dateStr}</td>
                  <td>{o.NetSales}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Form>
    </>
  );
}
