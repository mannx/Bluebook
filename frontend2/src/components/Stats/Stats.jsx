import * as React from "react";
import { useLoaderData, Outlet, Link } from "react-router-dom";
import { UrlGet, UrlApi2AverageStats, UrlApiTop5 } from "../URLs";

import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

import ErrorOrData from "../Error";

export async function dataLoader({ params }) {
  const url = UrlGet(UrlApi2AverageStats) + "?year=" + params.year;
  const resp = await fetch(url);
  const data = await resp.json();

  return { data };
}

export async function loader() {
  // cheat and use the top5 endpoint to get hte list of years we have data for
  const url = UrlGet(UrlApiTop5);
  const resp = await fetch(url);
  const data = await resp.json();

  return { data };
}

export default function SimpleStats() {
  const { data } = useLoaderData();
  const [year, setYear] = React.useState("0");
  const updateYear = (e) => {
    setYear(e.target.value);
  };

  const outputData = (data) => {
    return (<>
        <Stack>
          <InputLabel id="year">Year</InputLabel>
          <Select labelId="year" value={year} onChange={updateYear}>
            {data.map((n) => {
              return (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              );
            })}
          </Select>

          <Link to={`/stats/simple/${year}`}>
            <Button variant="contained">View</Button>
          </Link>
        </Stack>

        <Outlet />
      </>);
  };

  return (
    <>
      <Container>
        {ErrorOrData(data, outputData)}
      </Container>
    </>
  );
}

// display several different stats to start with
export function SimpleStatsYear() {
  const { data } = useLoaderData();
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const dataDisplay = (data) => {
    return (<>
          <h3>Counts</h3>
          <span>Total: {data.Total}</span>
          <hr />
          {dayNames.map((n, i) => {
            const out = data.Counts[i] || 0;
            return (
              <div>
                {n}: {out}
              </div>
            );
          })}
          </>);
  }

  return (
    <>
      <Container>
        <h3>Top Day per week</h3>
        <Container>
          {ErrorOrData(data, dataDisplay)}
        </Container>
      </Container>
    </>
  );
}

