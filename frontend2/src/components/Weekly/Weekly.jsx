import {Form, useLoaderData} from "react-router-dom";
import {NumericFormat} from "react-number-format";

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

import {
    UrlGet,
    UrlApiWeekly,
    UrlApi2WeeklyExport,
    GetPostOptions,
} from "../URLs";

export async function loader({params}) {
    const url = UrlGet(UrlApiWeekly) + "?month=" + params.month + "&day=" + params.day + "&year=" + params.year;
    const resp = await fetch(url);
    const data = await resp.json();

    return {
        ...data,
        ...params,
    };
}

export async function action({request, params}) {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);

    const body = {
        ...params,
        ...updates,
    }

    const url = UrlGet(UrlApi2WeeklyExport);
    const resp = await fetch(url, GetPostOptions(JSON.stringify(body)));
    const data = await resp.json();
    console.log(data);

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
    const data = useLoaderData();

    return (<>
        <Container sx={{ margin: 2 }}>
        <table><caption>Weekly Report</caption>
            <thead><tr className="Month">
                <th>Name</th><th>Value</th>
            </tr></thead>
            <tbody>
                <tr className="Month"><td className="Month">Target AUV</td><td className="Month">{data.TargetAUV}</td></tr>
                <tr className="Month"><td className="Month">&nbsp;</td><td className="Month"></td></tr>
                <tr className="Month"><td className="Month">Sales Last Year</td><td className="Month">{NF(data.LastYearSales)}</td></tr>
                <tr className="Month"><td className="Month">Sales This Week</td><td className="Month">{NF(data.NetSales)}</td></tr>
                <tr className="Month"><td className="Month">Upcoming Sales</td><td className="Month">{NF(data.UpcomingSales)}</td></tr>
                <tr className="Month"><td className="Month">&nbsp;</td><td className="Month"></td></tr>
                <tr className="Month"><td className="Month">Bread Plate Count</td><td className="Month">{NF(data.BreadOverShort)}</td></tr>
                <tr className="Month"><td className="Month">Food Cost $</td><td className="Month">{NF(data.FoodCostAmount)}</td></tr>
                <tr className="Month"><td className="Month">Labour Cost $</td><td className="Month">{NF(data.LabourCostAmount)}</td></tr>
                <tr className="Month"><td className="Month">&nbsp;</td><td className="Month"></td></tr>
                <tr className="Month"><td className="Month">Customer Count</td><td className="Month">{NF(data.CustomerCount)}</td></tr>
                <tr className="Month"><td className="Month">Customer Last Year</td><td className="Month">{NF(data.LastYearCustomerCount)}</td></tr>
                <tr className="Month"><td className="Month">Party Sales</td><td className="Month">{NF(data.PartySales)}</td></tr>
                <tr className="Month"><td className="Month">&nbsp;</td><td className="Month"></td></tr>
                <tr className="Month"><td className="Month">Target Hours</td><td className="Month">{NF(data.TargetHours)}</td></tr>
                <tr className="Month"><td className="Month">&nbsp;</td><td className="Month"></td></tr>
                <tr className="Month"><td className="Month">Gift Card Sold</td><td className="Month">{NF(data.GiftCardSold)}</td></tr>
                <tr className="Month"><td className="Month">Gift Card Redeem</td><td className="Month">{NF(data.GiftCardRedeem)}</td></tr>
                <tr className="Month"><td className="Month">&nbsp;</td><td className="Month"></td></tr>
            </tbody>
        </table>
        </Container>
        <Form method="post" id="weekly-info">
            <Stack direction="row" spacing={2}>
            <TextField id="hours" name="hours" label="Hours Used" variant="outlined" autoFocus />
            <TextField id="manager" name="manager" label="Manager Hours Used" variant="outlined" />
            <TextField id="sysco" name="sysco" label="Sysco Cost" variant="outlined" />
            <Button variant="contained" type="submit">Export</Button>
            </Stack>
        </Form>
        </>
    );
}
