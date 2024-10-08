import * as React from "react";
import { UrlApi2RawDayData, UrlApiTop5 } from "../URLs";
import { Form, useLoaderData, Link } from "react-router-dom";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";

import { DataGrid } from "@mui/x-data-grid";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function loader({ params }) {
  let query = [];

  if (params.minYear !== undefined) {
    query.push("minYear=" + params.minYear);
  }

  if (params.maxYear !== undefined) {
    query.push("maxYear=" + params.maxYear);
  }

  if (params.limit !== undefined) {
    query.push("limit=" + params.limit);
  }

  const q = query.join("&");
  const url = UrlApi2RawDayData + "?" + q;
  const resp = await fetch(url);
  const data = await resp.json();

  // get list of years for filtering
  // re-use top5 api endpoint
  const years = await (await fetch(UrlApiTop5)).json();

  if (years.Error === true) {
    console.log("error fetching errors.  todo");

    return { data, years: {} };
  }

  const yr = JSON.parse(years.Data);

  return { data, years: yr };
}

const columns = [
  { field: "id", headerName: "id", width: 90 },
  { field: "dayofweek", headerName: "Day of Week", width: 150 },
  { field: "date", headerName: "Date", width: 150 },
  { field: "netsales", headerName: "Net Sales", width: 150 },
];

export default function DayDataViewer() {
  const { data, years } = useLoaderData();

  const [minYear, setMinYear] = React.useState(years[years.length - 1]);
  const [maxYear, setMaxYear] = React.useState(years[0]);
  const [limit, setLimit] = React.useState(0);

  const rows = data.map((obj) => {
    // remove timezone information from date to prevent showing previous day
    const day = dayjs.utc(obj.Date);

    return {
      id: obj.ID,
      dayofweek: day.format("dddd"),
      date: day.format("MMM-DD-YYYY"),
      netsales: obj.NetSales,
    };
  });

  return (
    <>
      <Form>
        <Stack spacing={2} direction="row">
          <Stack>
            <InputLabel id="year">Min Year</InputLabel>
            <Select
              labelId="year"
              name="minYear"
              defaultValue={years[years.length - 1]}
              value={minYear}
              onChange={(e) => setMinYear(e.target.value)}
            >
              {years.map((n) => {
                return (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                );
              })}
            </Select>
          </Stack>

          <Stack>
            <InputLabel id="year">Max Year</InputLabel>
            <Select
              labelId="year"
              name="maxYear"
              defaultValue={years[years.length - 1]}
              value={maxYear}
              onChange={(e) => setMaxYear(e.target.value)}
            >
              {years.map((n) => {
                return (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                );
              })}
            </Select>
          </Stack>

          <Stack>
            <InputLabel id="limit">Limit</InputLabel>
            <TextField
              name="limit"
              label="Limit"
              type="number"
              defaultValue="0"
              onChange={(e) => setLimit(e.target.value)}
            />
          </Stack>

          <Link to={`/ddviewer/${minYear}/${maxYear}/${limit}`}>
            <Button variant="contained">Update</Button>
          </Link>
        </Stack>
      </Form>
      <Box>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 30,
              },
            },
          }}
          pageSizeOptions={[5, 30]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
    </>
  );
}
