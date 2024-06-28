import * as React from "react";
import { Outlet, Link, useLoaderData } from "react-router-dom";
import { NumericFormat } from "react-number-format";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";

import Typography from "@mui/material/Typography";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import { UrlGet, UrlApiTop5, UrlApiTop5Data } from "../URLs";
import ErrorOrData from "../Error";

const monthNames = [
  "Any",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export async function loader() {
  const url = UrlGet(UrlApiTop5);
  const resp = await fetch(url);
  const data = await resp.json();

  return { data };
}

export default function Top5() {
  const { data } = useLoaderData();

  const [month, setMonth] = React.useState(0);
  const [year, setYear] = React.useState("0");

  const updateMonth = (e) => {
    setMonth(e.target.value);
  };

  const updateYear = (e) => {
    setYear(e.target.value);
  };

  const outputData = (data) => {
    return (
      <>
        <Stack spacing={2}>
          <InputLabel id="month">Month</InputLabel>
          <Select
            labelId="month"
            id="month-select"
            value={month}
            label="MonthL"
            onChange={updateMonth}
          >
            {monthNames.map((n, i) => {
              return (
                <MenuItem key={i} value={i}>
                  {n}
                </MenuItem>
              );
            })}
          </Select>

          <InputLabel id="year">Year</InputLabel>
          <Select labelId="year" value={year} onChange={updateYear}>
            <MenuItem key={-1} value="0">
              Any
            </MenuItem>
            {data.map((n) => {
              return (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              );
            })}
          </Select>

          <Link to={`/top5/${month}/${year}`}>
            <Button variant="contained">View</Button>
          </Link>
        </Stack>
      </>
    );
  };

  return (
    <>
      <Container component={Paper}>
        <h3>Top 5</h3>
        {ErrorOrData(data, outputData)}
      </Container>
      <Outlet />
    </>
  );
}

// top5Data loader /:month/:year  if either is unused, is 0
export async function dataLoader({ params }) {
  const p = "?month=" + params.month + "&year=" + params.year + "&limit=5";
  const url = UrlGet(UrlApiTop5Data) + p;
  const resp = await fetch(url);
  const data = await resp.json();

  return {
    ...data,
    ...params,
  };
}

export function Top5Data() {
  const data = useLoaderData();

  const NF = (obj) => {
    return (
      <NumericFormat
        value={obj}
        displayType={"text"}
        prefix={"$"}
        decimalScale={2}
        fixedDecimalScale={true}
      />
    );
  };

  const outputData = (data, resp) => {
    return data.Data.map((n) => {
      return (
        <>
          <Typography sx={{ flex: "1 1 100%" }} component="div" variant="h6">
            {n.Title}
          </Typography>

          <TableContainer sx={{ width: 1 / 8 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>$</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {n.Data.map((obj) => {
                  const f = n.Field;
                  const val = obj[f];

                  return (
                    <TableRow>
                      <TableCell>{obj.DateString}</TableCell>
                      <TableCell>{NF(val)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      );
    });
  };

  return ErrorOrData(data, outputData);
}
