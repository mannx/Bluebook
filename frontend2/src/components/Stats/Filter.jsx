import { UrlGet, UrlApi2RawDayData, UrlApiTop5 } from "../URLs";
import * as React from "react";
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

export default function FilterDayData() {
  const [dayValue, setDayValue] = React.useState(0);

  const days = [
    "Sunday",
    "Monday",
    "Tuesay",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <>
      <Form>
        <Stack spacing={2} direction="row">
          <Stack>
            <InputLabel id="day">Day</InputLabel>
            <Select
              labelId="day"
              name="day"
              defaultValue={0}
              value={dayValue}
              onChange={(e) => setDayValue(e.target.value)}
            >
              {days.map((n, i) => {
                return (
                  <MenuItem key={i} value={i}>
                    {n}
                  </MenuItem>
                );
              })}
            </Select>
          </Stack>
        </Stack>
      </Form>
    </>
  );
}
