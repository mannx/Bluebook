// this page provides a date picker to validate a week ending date
import * as React from "react";

import { Link, Outlet } from "react-router-dom";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";

// true if day is not a tuesday to disable in the picker
// avoid picking unusable dates and needing an error message
const notTuesday = (date) => {
  return date.day() !== 2;
};

// pick our week ending, display error if not a tuesday
export default function WeeklyNav() {
  const [date, setDate] = React.useState(null);

  // if we have a selected date, get its values and pull in the weekly data
  let url = null;
  if (date !== null) {
    const day = date.date();
    const month = date.month() + 1; // month is 0 based
    const year = date.year();

    url = "/weekly/" + day + "/" + month + "/" + year;
  }

  return (
    <>
      <Container maxWidth="sm">
        <h2>Weekly</h2>

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
