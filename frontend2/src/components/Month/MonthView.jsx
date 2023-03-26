import {useLoaderData, redirect, Link} from "react-router-dom";
import {NumericFormat} from "react-number-format";
import UrlGet from "../URLs.jsx";

// make sure we have the correct css for our table
import "./month.css";

// retrieve the month/year we want to see
export async function loader({params}) {
    // get the api url to get the data
    const url = UrlGet("Month") + "?month=" + params.month + "&year=" + params.year;
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

// /today needs to redirect to the correct page for the current date
export async function today() {
    const d = new Date();
    const url = "/"+(d.getMonth()+1)+"/"+d.getFullYear();

    return redirect(url);
}

export default function MonthView() {
    const {data} = useLoaderData();

    // month navigation buttons are to be shows beside the month instead of the main navigation menu as previously done
    return (
        <table className="Month">
            <caption><h1>
                {prevMonth(data)}
                {data.MonthName} {data.Year}
                {nextMonth(data)}
            </h1></caption>
            <thead>
                <tr >
                    <th className="Month"></th>
                    <th className="Month">Day</th>
                    <th className="Month">Gross Sales</th>
                    <th className="Month">HST</th>
                    <th className="Month">Bot Dep</th>
                    <th className="Month">Net Sales</th>
                    <th className="blank"></th>

                    <th className="Month">Debit</th>
                    <th className="Month">Visa</th>
                    <th className="Month">MC</th>
                    <th className="Month">Amex</th>
                    <th className="Month">Credit Sales</th>
                    <th className="blank"></th>

                    <th className="Month">GC Redeem</th>
                    <th className="Month">GC Sold</th>
                    <th className="blank"></th>

                    <th className="Month">Hours</th>
                    <th className="Month">Prod</th>
                    <th className="Month">Factor</th>
                    <th className="Month">Adj Sales</th>
                    <th className="Month">Cust Count</th>
                    <th className="Month no-print">$ 3rd Party</th>
                    <th className="Month no-print">% 3rd Party</th>
                    <th className="blank"></th>

                    <th className="Month">Comments</th>
                    <th className="Month no-print">Tags</th>
                </tr>
            </thead>
            <tbody>
            {data.Data.map( (obj) => {
                const row = Row(obj);
                let eow = null;

                if(obj.IsEndOfWeek) {
                    // show table data & end of week row
                    eow = EOW(obj);
                }

                return <>{row}{eow}</>;
            })}
        </tbody>
        </table>
    );
}

// define several helper functions for displaying commonly formatted numbers
function NF(obj, prefix="", suffix="") {
    return (
        <NumericFormat
        value={obj}
        displayType={"text"}
        prefix={prefix}
        suffix={suffix}
        decimalScale={2}
        fixedDecimalScale={true}
        / >
    );
}

// output a general number
function O(obj) {
    return NF(obj);
}

function P(obj) { return NF(obj, "","%"); }		// output a percent
function Dol(obj) {return NF(obj,"$",""); }

// zero pad a number to 2 places
function Zero(obj) {
    var s = "00" + obj;
    return s.substring(s.length-2, s.length);
}

function Row(data) {
    var cls = "";

    switch(data.SalesLastWeek) {
        case 1: cls="NetSalesUp"; break;
        case -1: cls="NetSalesDown"; break;
        default: cls="NetSalesSame"; break;
    }

    // TODO: comments & tags
    return (
        <tr key={data.ID}>
        <td className="Month">{Zero(data.DayOfMonth)}</td>
        <td className="Month">{data.DayOfWeek}</td>
        <td className="Month">{O(data.GrossSales)}</td>
        <td className="Month">{O(data.HST)}</td>
        <td className="Month">{O(data.BottleDeposit)}</td>
        <td className={`${cls} ${"Month"}`}>
            <div className="tooltip-month">
                {O(data.NetSales)}
                <span className="tooltiptext-month">{O(data.WeeklyAverage)}</span>
            </div>
        </td>
        <td className="blank"></td>
        <td className="Month">{O(data.DebitCard)}</td>
        <td className="Month">{O(data.Visa)}</td>
        <td className="Month">{O(data.MasterCard)}</td>
        <td className="Month">{O(data.Amex)}</td>
        <td className="Month">{O(data.CreditSales)}</td>
        <td className="blank"></td>
        <td className="Month">{O(data.GiftCardRedeem)}</td>
        <td className="Month">{O(data.GiftCardSold)}</td>
        <td className="blank"></td>
        <td className="Month">{O(data.HoursWorked)}</td>
        <td className="Month">{O(data.Productivity)}</td>
        <td className="Month">{O(data.Factor)}</td>
        <td className="Month">{O(data.AdjustedSales)}</td>
        <td className="Month">{O(data.CustomerCount)}</td>
        <td className="Month no-print">{Dol(data.ThirdPartyDollar)}</td>
        <td className="Month no-print">{P(data.ThirdPartyPercent)}</td>
        <td className="blank"></td>
        </tr>
    );
}

function EOW(data) {
	return (
		<tr className="blank">
			<td className="spacer"></td>
			<td className="spacer"></td>
			<td className="spacer"></td>
			<td className="spacer"></td>
			<td className="spacer"></td>
			<td className="Net">{O(data.EOW.NetSales)}</td>

			<td className="spacer"></td>
			<td className="spacer"></td>
			<td className="spacer"></td>
			<td className="spacer"></td>
			<td className="spacer"></td>
			<td className="spacer"></td>
			<td className="spacer"></td>
			<td className="spacer"></td>
			<td className="spacer"></td>
			<td className="spacer"></td>
			<td className="spacer"></td>
			<td className="spacer"></td>
			<td className="spacer"></td>
			<td className="spacer"></td>
			<td className="CustomerCount">{O(data.EOW.CustomerCount)}</td>
			<td className="no-print">{O(data.EOW.ThirdPartyTotal)}</td>
			<td className="ThirdPartyPerc no-print">{O(data.EOW.ThirdPartyPercent)}%</td>
		</tr>
	);
}

// return a link for the next month
function nextMonth(data) {
    var month = data.Month + 1;
    var year = data.Year;

    if(month > 12) {
        // move to next year
        month = 1;
        year = year + 1;
    }

    return monthNavLink(month, year, "Next");
}

// return a link to the previous month
function prevMonth(data) {
    var month = data.Month - 1;
    var year = data.Year;

    if(month < 1) {
        // wrap to previous year
        month = 12;
        year = year - 1;
    }

    return monthNavLink(month, year, "Prev");
}

// return the nav link for the given data
function monthNavLink(month, year, str) {
    const url = "/" + month + "/" + year;

    return (
        <Link to={url}>{str}</Link>
    );
}