import * as React from "react";
import { useLoaderData, Link, Outlet } from "react-router-dom";
import { UrlApiHockeyData, UrlApiHockeyDataYear } from "../URLs.jsx";
import { dayLink } from "../Tags/Tags";
import { NumberFormat } from "../Month/MonthView";

import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";

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

import Button from "@mui/material/Button";

export async function loader() {
  // get range of years we have data for
  const url2 = UrlApiHockeyDataYear;
  const resp2 = await fetch(url2);
  const years = await resp2.json();

  return { years };
}

export default function HockeyData() {
  const { years } = useLoaderData();
  const [year, setYear] = React.useState("0");
  const updateYear = (e) => {
    setYear(e.target.value);
  };

  return (
    <>
      <Container>
        <h3>Hockey Data</h3>

        <Stack spacing={2}>
          <InputLabel id="year">Year</InputLabel>
          <Select
            labelId="year"
            id="year-select"
            value={year}
            onChange={updateYear}
          >
            {years.map((n) => {
              return (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              );
            })}
          </Select>

          <Link to={`/hockey/data/${year}`}>
            <Button variant="contained">View</Button>
          </Link>
        </Stack>

        <Outlet />
      </Container>
    </>
  );
}

export function HockeyDataView() {
  const { data } = useLoaderData();

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small" sx={{ width: 1 / 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Net Sales</TableCell>
              <TableCell>Average Sales</TableCell>
              <TableCell>Away Team</TableCell>
              <TableCell>Score (Home - Away)</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data !== null &&
              data.map((obj, i) => {
                const cls =
                  obj.NetSales >= obj.Average ? "NetSalesUp" : "NetSalesDown";
                const wincls =
                  obj.GFHome > obj.GFAway ? "NetSalesUp" : "NetSalesDown";

                return (
                  <TableRow key={i}>
                    <TableCell>{dayLink(obj.Date)}</TableCell>
                    <TableCell className={cls}>
                      {NumberFormat(obj.NetSales)}
                    </TableCell>
                    <TableCell>{NumberFormat(obj.Average)}</TableCell>
                    <TableCell>{obj.AwayTeam}</TableCell>
                    <TableCell className={wincls}>
                      {obj.GFHome} - {obj.GFAway}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export async function viewLoader({ params }) {
  const year = params.year !== undefined ? "?year=" + params.year : "";
  const url = UrlApiHockeyData + year;
  console.log(url);
  const resp = await fetch(url);
  const data = await resp.json();

  return { data };
}

