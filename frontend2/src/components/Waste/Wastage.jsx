// Wastage.jsx is used to show total wastage amounts for a given week
import * as React from "react";

import { Form, Outlet, Link, useLoaderData } from "react-router-dom";
import { NumericFormat } from "react-number-format";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import dayjs from "dayjs";

import {
  UrlGet,
  UrlApiWasteView,
  UrlApiWasteExport,
  GetPostOptions,
} from "../URLs";

// true if day is not a tuesday to disable in the picker
// avoid picking unusable dates and needing an error message
const notTuesday = (date) => {
  return date.day() !== 2;
};

// returns the closest tuesday from where we are
function getInitialDate() {
  const now = dayjs();
  const day = now.day(); // 0-sunday

  // 0-1 push ahead to the next tuesday
  // 2 - tue, do nothing
  // 3-6 - move back to previous tue
  let offset = 0;

  switch (day) {
    case 0:
    case 1:
      offset = 2 - day;
      break;
    case 3:
    case 4:
    case 5:
    case 6:
      offset = -(day - 2);
      break;
  }

  return now.add(offset, "day");
}

export default function WasteView() {
  const [date, setDate] = React.useState(getInitialDate());

  // if we have a selected date, get its values and pull in the weekly data
  let url = null;

  if (date !== null) {
    const now = dayjs();

    const day = date.date();
    const month = date.month() + 1; // month is 0 based
    const year = date.year();

    url = "/wastage/" + day + "/" + month + "/" + year;
  }

  return (
    <>
      <Container maxWidth="sm">
        <h2>Wastage</h2>

        <DatePicker
          value={date}
          onChange={(e) => setDate(e)}
          shouldDisableDate={notTuesday}
        />
        {url !== null ? (
          <>
            <br />
            <Link to={url}>
              <Button variant="contained">Load</Button>
            </Link>
          </>
        ) : (
          <></>
        )}
      </Container>
      <div>
        <Outlet />
      </div>
    </>
  );
}

export async function loader({ params }) {
  const url =
    UrlGet(UrlApiWasteView) +
    "?month=" +
    params.month +
    "&day=" +
    params.day +
    "&year=" +
    params.year;
  const resp = await fetch(url);
  const data = await resp.json();

  return {
    ...data,
    ...params,
  };
}

function NF(obj) {
  return (
    <NumericFormat
      value={obj}
      displayType={"text"}
      decimalScale={2}
      fixedDecimalScale={true}
    />
  );
}

export async function action({ params }) {
  const url = UrlGet(UrlApiWasteExport);
  const body = {
    Month: parseInt(params.month),
    Day: parseInt(params.day),
    Year: parseInt(params.year),
  };

  const opt = GetPostOptions(JSON.stringify(body));
  await fetch(url, opt);

  return null;
}

export function WasteTable() {
  const data = useLoaderData();

  return (
    <>
      <TableContainer component={Paper} sx={{ width: 1 / 4 }}>
        <h3>
          Wastage for week of {data.month}/{data.day}/{data.year}
        </h3>
        <Form method="post">
          <Button variant="contained" type="submit">
            Export
          </Button>
        </Form>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.Data.map((e) => {
              if (e.Name === "") {
                return (
                  <TableRow>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                );
              }

              return (
                <TableRow>
                  <TableCell>{e.Name}</TableCell>
                  <TableCell>{NF(e.Amount)}</TableCell>
                  <TableCell>{e.UnitOfMeasure}</TableCell>
                  <TableCell>{e.LocationString}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
