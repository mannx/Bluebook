import { Form, useLoaderData, useActionData, useNavigate, redirect } from "react-router-dom";
import {
  UrlGet,
  UrlApi2DayEdit,
  UrlApi2DayUpdate,
  GetPostOptions,
} from "../URLs.jsx";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Container  from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import TextField from "@mui/material/TextField";
import ErrorOrData from "../Error.jsx";

// Tag builds the user friendly display of all tags on this day
// returns as a string
function Tag(data) {
  if (data === undefined || data === null) return "";
  return data.join(" ");
}

// extract the date from the url in form of YYYYMMDD and return a date object
export async function loader({ params }) {
  var q = "";
  if (params.date === undefined) {
    // no date, use id
    q = "?id=" + params.id;
  } else {
    // date provided, ignore id
    // but id is required by api -- set to 0
    q = "?id=0&date=" + params.date;
  }

  const url = UrlGet(UrlApi2DayEdit) + q;
  const resp = await fetch(url);
  const data = await resp.json();

  return { data, 
    month: params.month,
    year: params.year
  };
}

export async function action({ request, params }) {
  const formData = await request.formData(); // get the data from the form
  const updates = Object.fromEntries(formData); // pull everything into an object (otherwise use formData.get(...))
  const id = parseInt(params.id);

  // combine the data we are sending to the server
  const body = {
    Tags: updates.tags,
    Comment: updates.comment,
    ID: id,
    Date: params.date,
  };

  const opt = GetPostOptions(JSON.stringify(body));
  const resp = await fetch(UrlGet(UrlApi2DayUpdate), opt);
  const data = await resp.json();

  // if we have an error, display the message and allow to be re-submitted
  if(data.Error !== undefined && data.Error == true){
    return data;
  }

  return redirect("/" + updates.month + "/" + updates.year);
}

// this page is used to edit DayData information including comments and tags
// we are provided with either a db ID or a date if no entry has been created yet
// we also have the month/year of the page to return to when done
export default function DayEdit() {
  const { data, month, year } = useLoaderData();
  const navigate = useNavigate();
  const  action  = useActionData();

  const outputData = (data) => {
    const displayError = () => {
        if(action !== undefined && action.Error !== undefined && action.Error === true) {
          return (<><div><Typography sx={{color: "red"}} variant="h5">{action.Message}</Typography></div></>);
        }
        return <></>;
    }

    return (
      <>
        <h1>Day Data Edit</h1>
        <Form method="post" id="daydata-edit">
          <Stack direction="row" spacing={2}>
            <Button variant="contained" type="submit">
              Save
            </Button>
            <Button variant="contained" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </Stack>

          <Container>{displayError()}</Container>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                <TableRow
                  row="Date"
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    Date
                  </TableCell>
                  <TableCell>{data.Date}</TableCell>
                </TableRow>

                <TableRow
                  row="Comment"
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    Comment
                  </TableCell>
                  <TableCell>
                    <TextField
                      id="comment"
                      label="Comment"
                      defaultValue={data.Comment}
                      name="comment"
                      fullWidth
                    />
                  </TableCell>
                </TableRow>

                <TableRow
                  row="Tags"
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    Comment
                  </TableCell>
                  <TableCell>
                    <TextField
                      id="tags"
                      label="tags"
                      defaultValue={Tag(data.Tags)}
                      name="tags"
                      fullWidth
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <input type="hidden" name="month" value={month} />
          <input type="hidden" name="year" value={year} />
        </Form>
      </>
    );
  }

  return ErrorOrData(data, outputData);
}
