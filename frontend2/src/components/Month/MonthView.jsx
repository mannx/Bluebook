import { useLoaderData, redirect, Link } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import { UrlApiMonth, UrlApiSettingsGet } from "../URLs.jsx";

// make sure we have the correct css for our table
import "./month.css";

// retrieve the month/year we want to see
export async function loader({ params }) {
  const url = UrlApiMonth + "?month=" + params.month + "&year=" + params.year;
  const resp = await fetch(url);
  const data = await resp.json();

  // get the settings for optional display items
  const r2 = await fetch(UrlApiSettingsGet);
  const settings = await r2.json();

  return { data, settings };
}

// /today needs to redirect to the correct page for the current date
export async function today() {
  const d = new Date();
  const url = "/" + (d.getMonth() + 1) + "/" + d.getFullYear();

  return redirect(url);
}

export default function MonthView() {
  const { data, settings } = useLoaderData();

  // month navigation buttons are to be shows beside the month instead of the main navigation menu as previously done
  return (
    <table className="Month">
      <caption>
        <h3 className="no-print">
          <span>{prevMonth(data)} </span>
          <span>{nextMonth(data)} </span>
          <span>{prevYear(data)} </span>
          <span>{nextYear(data)}</span>
        </h3>
        <h1>
          {data.MonthName} {data.Year}
        </h1>
      </caption>
      <thead>
        <tr>
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
          <th className="blank no-print"></th>

          <th className="Month no-print"></th>
          <th className="Month">Comments</th>
          <th className="Month no-print">Tags</th>
          <th className="Month no-print">Edit</th>
        </tr>
      </thead>
      <tbody>
        {data.Data.map((obj) => {
          const row = Row(obj);
          let eow = null;

          if (obj.IsEndOfWeek) {
            // show table data & end of week row
            eow = EOW(obj);
          }

          return (
            <>
              {row}
              {eow}
            </>
          );
        })}
      </tbody>
    </table>
  );
}

// define several helper functions for displaying commonly formatted numbers
function NF(obj, prefix = "", suffix = "") {
  return (
    <NumericFormat
      value={obj}
      displayType={"text"}
      prefix={prefix}
      suffix={suffix}
      decimalScale={2}
      fixedDecimalScale={true}
    />
  );
}

export function NumberFormat(obj, prefix = "", suffix = "") {
  return NF(obj, prefix, suffix);
}

// output a general number
function O(obj) {
  return NF(obj);
}

function P(obj) {
  return NF(obj, "", "%");
} // output a percent

function Dol(obj) {
  return NF(obj, "$", "");
}

// zero pad a number to 2 places
function Zero(obj) {
  var s = "00" + obj;
  return s.substring(s.length - 2, s.length);
}

function Row(data) {
  let cls = "";
  let url = "/" + data.Hockey.AwayImage;
  let img = <img className="team-logo" src={url} />;
  let hock = data.Hockey.HomeGame === true ? img : <></>;

  let hcls = "";
  let htip = "";

  if (data.Hockey.HomeGame === true) {
    if (data.Hockey.GFHome === 0 && data.Hockey.GFAway === 0) {
      // game not yet played, skip
    } else if (data.Hockey.GFHome > data.Hockey.GFAway) {
      hcls = "HockeyWin";
    } else {
      hcls = "HockeyLoss";
    }

    htip = (
      <>
        <span>
          {data.Hockey.Away}
          <br />
        </span>
        <span>
          Home: {data.Hockey.GFHome} Away: {data.Hockey.GFAway}
        </span>
      </>
    );
  }

  switch (data.SalesLastWeek) {
    case 1:
      cls = "NetSalesUp";
      break;
    case -1:
      cls = "NetSalesDown";
      break;
    default:
      cls = "NetSalesSame";
      break;
  }

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

      <td className="blank no-print"></td>
      <td className={`${hcls} ${"Month"} ${"no-print"}`}>
        <div className="tooltip-month">
          {hock}
          <div className="tooltiptext-month">{htip}</div>
        </div>
      </td>
      <td className="Month">{data.Comment}</td>
      <td className="Month no-print">{Tag(data.Tags, data.TagID)}</td>
      <td className="Month no-print">
        {data.ID !== 0 ? (
          <Link to={"/edit/" + data.Month + "/" + data.Year + "/" + data.ID}>
            E
          </Link>
        ) : (
          <Link
            to={
              "/edit/" + data.Month + "/" + data.Year + "/0/" + hashDate(data)
            }
          >
            C
          </Link>
        )}
      </td>
    </tr>
  );
}

// output the date as a series of only numbers. used to reference the day when we dont have
// a db entry yet
function hashDate(data) {
  const year = "" + data.Year;
  const month = Zero("" + data.Month);
  const day = Zero("" + data.Day);

  return year + month + day;
}
function EOW(data) {
  return (
    <tr key={"eow-" + data.ID} className="blank">
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
      <td className="ThirdPartyPerc no-print">
        {O(data.EOW.ThirdPartyPercent)}%
      </td>
    </tr>
  );
}

// Tag builds the user friendly display of all tags on this day
// returns as a string
function Tag(data, ids) {
  if (data !== null) {
    return (
      <>
        {data.map((o, i) => {
          return <Link to={"/tags/" + ids[i]}>#{o}</Link>;
        })}
      </>
    );
  }

  return <></>;
}

// return a link for the next month
function nextMonth(data) {
  var month = data.Month + 1;
  var year = data.Year;

  if (month > 12) {
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

  if (month < 1) {
    // wrap to previous year
    month = 12;
    year = year - 1;
  }

  return monthNavLink(month, year, "Prev");
}

function prevYear(data) {
  return monthNavLink(data.Month, data.Year - 1, "Prev Year");
}

function nextYear(data) {
  const currentYear = new Date().getFullYear();

  if (data.Year !== currentYear) {
    return monthNavLink(data.Month, data.Year + 1, "Next Year");
  }

  return <></>;
}
// return the nav link for the given data
function monthNavLink(month, year, str) {
  const url = "/" + month + "/" + year;

  return <Link to={url}>{str}</Link>;
}
