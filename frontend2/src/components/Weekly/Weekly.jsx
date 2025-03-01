import * as React from "react";
import { Form, useLoaderData } from "react-router-dom";
import { NumericFormat } from "react-number-format";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Switch from "@mui/material/Switch";

import { UrlApiWeekly, UrlApi2WeeklyExport, GetPostOptions } from "../URLs";
import { Typography } from "@mui/material";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

export async function loader({ params }) {
  const url =
    UrlApiWeekly + "/" + params.month + "/" + params.day + "/" + params.year;
  const resp = await fetch(url);
  const data = await resp.json();

  console.log(params);
  console.log(data);

  return {
    ...data,
    ...params,
  };
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  const hours = parseFloat(updates.hours);
  const manager = parseFloat(updates.manager);
  const sysco = parseFloat(updates.sysco);

  const body = {
    week_ending: updates.week_ending,
    hours: isNaN(hours) ? 0.0 : hours,
    manager: isNaN(manager) ? 0.0 : manager,
    sysco: isNaN(sysco) ? 0.0 : sysco,
    netsales: updates.netsales === "true",
  };

  const url = UrlApi2WeeklyExport;
  const resp = await fetch(url, GetPostOptions(JSON.stringify(body)));
  const data = await resp.json();

  return null;
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

export default function Weekly() {
  const [useNetSales, setUseNetSales] = React.useState(false);
  const data = useLoaderData();

  const handleNetSalesChange = (e) => {
    setUseNetSales(e.target.checked);
  };

  const mismatch = data.NetSalesMismatch ? (
    <Typography sx={{ color: "red" }} variant="h4">
      Net Sales Mismatch
    </Typography>
  ) : (
    <></>
  );

  const mismatchOutput = (
    <>
      <td className="Month">
        <Switch checked={useNetSales} onChange={handleNetSalesChange} />
      </td>
      <td className="Month">{data.WisrNetSales}</td>
    </>
  );

  const sysco_week = dayjs.utc(data.PrevWeek).format("MM-DD-YYYY");

  return (
    <>
      <Container sx={{ margin: 2 }}>
        {mismatch}
        <table>
          <caption>Weekly Report</caption>
          <thead>
            <tr className="Month">
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="Month">
              <td className="Month">Target AUV</td>
              <td className="Month">{data.TargetAUV}</td>
            </tr>
            <tr className="Month">
              <td className="Month">&nbsp;</td>
              <td className="Month"></td>
            </tr>
            <tr className="Month">
              <td className="Month">Sales Last Year</td>
              <td className="Month">{NF(data.LastYearSales)}</td>
            </tr>
            <tr className="Month">
              <td className="Month">Sales This Week</td>
              <td className="Month">{NF(data.NetSales)}</td>
              {data.NetSalesMismatch === true ? mismatchOutput : <></>}
            </tr>
            <tr className="Month">
              <td className="Month">Upcoming Sales</td>
              <td className="Month">{NF(data.UpcomingSales)}</td>
            </tr>
            <tr className="Month">
              <td className="Month">&nbsp;</td>
              <td className="Month"></td>
            </tr>
            <tr className="Month">
              <td className="Month">Bread Plate Count</td>
              <td className="Month">{NF(data.BreadOverShort)}</td>
            </tr>
            <tr className="Month">
              <td className="Month">Food Cost $</td>
              <td className="Month">{NF(data.FoodCostAmount)}</td>
            </tr>
            <tr className="Month">
              <td className="Month">Labour Cost $</td>
              <td className="Month">{NF(data.LabourCostAmount)}</td>
            </tr>
            <tr className="Month">
              <td className="Month">&nbsp;</td>
              <td className="Month"></td>
            </tr>
            <tr className="Month">
              <td className="Month">Productivity Budget</td>
              <td className="Month">{NF(data.ProductivityBudget)}</td>
            </tr>
            <tr className="Month">
              <td className="Month">Productivity Actual</td>
              <td className="Month">{NF(data.ProductivityActual)}</td>
            </tr>
            <tr className="Month">
              <td className="Month">Customer Count</td>
              <td className="Month">{NF(data.CustomerCount)}</td>
            </tr>
            <tr className="Month">
              <td className="Month">Customer Last Year</td>
              <td className="Month">{NF(data.LastYearCustomerCount)}</td>
            </tr>
            <tr className="Month">
              <td className="Month">Party Sales</td>
              <td className="Month">{NF(data.PartySales)}</td>
            </tr>
            <tr className="Month">
              <td className="Month">&nbsp;</td>
              <td className="Month"></td>
            </tr>
            <tr className="Month">
              <td className="Month">Target Hours</td>
              <td className="Month">{NF(data.TargetHours)}</td>
            </tr>
            <tr className="Month">
              <td className="Month">&nbsp;</td>
              <td className="Month"></td>
            </tr>
            <tr className="Month">
              <td className="Month">Gift Card Sold</td>
              <td className="Month">{NF(data.GiftCardSold)}</td>
            </tr>
            <tr className="Month">
              <td className="Month">Gift Card Redeem</td>
              <td className="Month">{NF(data.GiftCardRedeem)}</td>
            </tr>
            <tr className="Month">
              <td className="Month">&nbsp;</td>
              <td className="Month"></td>
            </tr>
          </tbody>
        </table>
      </Container>
      <Form method="post" id="weekly-info">
        <Stack direction="row" spacing={2}>
          <TextField
            id="hours"
            name="hours"
            label="Hours Used"
            variant="outlined"
            autoFocus
          />
          <TextField
            id="manager"
            name="manager"
            label="Manager Hours Used"
            variant="outlined"
          />
          <TextField
            id="sysco"
            name="sysco"
            label={"Sysco " + sysco_week}
            variant="outlined"
          />
          <input
            type="hidden"
            id="netsales"
            name="netsales"
            value={useNetSales}
          />
          <input type="hidden" name="week_ending" value={data.WeekEnding} />
          <Button variant="contained" type="submit">
            Export
          </Button>
        </Stack>
      </Form>
    </>
  );
}
