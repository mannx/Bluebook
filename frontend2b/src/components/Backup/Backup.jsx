import {
  useLoaderData,
  useActionData,
  redirect,
  Link,
  Form,
} from "react-router-dom";

import { UrlApiBackupGet, UrlApiBackupUndo, GetPostOptions } from "../URLs.jsx";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";

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

  return (
    <>
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
    </>
  );
}
