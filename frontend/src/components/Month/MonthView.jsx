import { useLoaderData, redirect, Link } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import { UrlApiMonth, UrlApiSettingsGet } from "../URLs.jsx";

// make sure we have the correct css for our table
import "./month.css";

import dayjs from "dayjs";

// retrieve the month/year we want to see
export async function loader({ params }) {
  const url = UrlApiMonth + "/" + params.month + "/" + params.year;
  const resp = await fetch(url);
  const data = await resp.json();

  // get the settings for optional display items
  const r2 = await fetch(UrlApiSettingsGet);
  const settings = await r2.json();

  params.month = params.month - 1; // adjust since dayjs using a 0 based month system
  return { data, params, settings };
}

// /today needs to redirect to the correct page for the current date
export async function today() {
  const d = new Date();
  const url = "/" + (d.getMonth() + 1) + "/" + d.getFullYear();

  return redirect(url);
}

export default function MonthView() {
  const { data, params, settings } = useLoaderData();

  // month navigation buttons are to be shows beside the month instead of the main navigation menu as previously done
  const date = dayjs(new Date(params.year, params.month, 1));
  return (
    <table className="Month">
      <caption>
        <h3 className="no-print">
          <span>{prevMonth(date)} </span>
          <span>{nextMonth(date)} </span>
          <span>{prevYear(date)} </span>
          <span>{nextYear(date)}</span>
        </h3>
        <h1>{date.format("MMMM YYYY")}</h1>
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
        {data.map((obj) => {
          const row = Row(obj, settings);
          let eow = null;

          if (obj.EndOfWeek !== null) {
            // show table data & end of week row
            eow = EndOfWeek(obj);
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
// div -> if true, divide obj by 100 to convert back to a float
export function NF(obj, prefix = "", suffix = "") {
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

// output a general number
function O(obj) {
  return NF(obj);
}

// output a number that needs to get converted back to a float
// ie. anything that is supposed to be currency
function F(obj) {
  return NF(obj / 100.0, "", "");
}

function P(obj) {
  return NF(obj, "", "%");
} // output a percent

function Dol(obj) {
  return NF(obj / 100.0, "$", "");
}

// zero pad a number to 2 places
function Zero(obj) {
  var s = "00" + obj;
  return s.substring(s.length - 2, s.length);
}

function get_hockey_tag(data, settings) {
  if (data.Hockey) {
    const url = "/" + data.Hockey.AwayImage;
    const img = <img className="team-logo" src={url} />;
    const home_game = is_home_game(data, settings);
    return home_game ? img : <></>;
  } else {
    return <></>;
  }
}

function is_home_game(data, settings) {
  if (data.Hockey) {
    return data.Hockey.Home === settings.HockeyHomeTeam;
  }
  return false;
}

function Row(data, settings) {
  let cls = "";

  const hock = get_hockey_tag(data, settings);
  const home_game = is_home_game(data, settings);

  let hcls = "";
  let htip = "";

  if (data.Hockey) {
    if (home_game) {
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
            ^18.3.1
          </span>
          <span>
            Home: {data.Hockey.GFHome} Away: {data.Hockey.GFAway}
          </span>
        </>
      );
    }
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

  const dj = dayjs(new Date(data.Year, data.Month - 1, data.Day));

  const third_perc = (data.ThirdPartyDollar / data.Data.NetSales) * 100.0;
  return (
    <tr key={data.ID}>
      <td className="Month">{Zero(data.Day)}</td>
      <td className="Month">{dj.format("dddd")}</td>
      <td className="Month">{F(data.GrossSales)}</td>
      <td className="Month">{F(data.Data.Hst)}</td>
      <td className="Month">{F(data.Data.BottleDeposit)}</td>
      <td className={`${cls} ${"Month"}`}>
        <div className="tooltip-month">
          {F(data.Data.NetSales)}
          <span className="tooltiptext-month">{F(data.WeeklyAverage)}</span>
        </div>
      </td>
      <td className="blank"></td>
      <td className="Month">{F(data.Data.DebitCard)}</td>
      <td className="Month">{F(data.Data.Visa)}</td>
      <td className="Month">{F(data.Data.MasterCard)}</td>
      <td className="Month">{F(data.Data.Amex)}</td>
      <td className="Month">{F(data.Data.CreditSales)}</td>
      <td className="blank"></td>
      <td className="Month">{F(data.Data.GiftCardRedeem)}</td>
      <td className="Month">{F(data.Data.GiftCardSold)}</td>
      <td className="blank"></td>
      <td className="Month">{F(data.Data.HoursWorked)}</td>
      <td className="Month">{F(data.Data.Productivity)}</td>
      <td className="Month">{F(data.Data.Factor)}</td>
      <td className="Month">{O(data.Data.AdjustedSales)}</td>
      <td className="Month">{O(data.Data.CustomerCount)}</td>
      <td className="Month no-print">{Dol(data.ThirdPartyDollar)}</td>
      <td className="Month no-print">{P(third_perc)}</td>

      <td className="blank no-print"></td>
      <td className={`${hcls} ${"Month"} ${"no-print"}`}>
        <div className="tooltip-month">
          {hock}
          <div className="tooltiptext-month">{htip}</div>
        </div>
      </td>
      <td className="Month">{data.Data.CommentData}</td>
      <td className="Month no-print">{Tag(data.Tags)}</td>
      <td className="Month no-print">
        {data.Data.id !== 0 ? (
          <Link
            to={"/edit/" + data.Month + "/" + data.Year + "/" + data.Data.id}
          >
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

  // return year + month + day;
  return "" + data.Year + "-" + data.Month + "-" + data.Day;
}
function EndOfWeek(data) {
  const tpp =
    (data.EndOfWeek.ThirdPartyTotal / data.EndOfWeek.GrossSales) * 100.0;

  return (
    <tr key={"eow-" + data.ID} className="blank">
      <td className="spacer"></td>
      <td className="spacer"></td>
      <td className="spacer"></td>
      <td className="spacer"></td>
      <td className="spacer"></td>
      <td className="Net">{F(data.EndOfWeek.NetSales)}</td>

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
      <td className="CustomerCount">{O(data.EndOfWeek.CustomerCount)}</td>
      <td className="no-print">{F(data.EndOfWeek.ThirdPartyTotal)}</td>
      <td className="ThirdPartyPerc no-print">{O(tpp)}%</td>
    </tr>
  );
}

// Tag builds the user friendly display of all tags on this day
// returns as a string
function Tag(data) {
  if (data !== null) {
    return (
      <>
        {data.map((o) => {
          return <Link to={"/tags/" + o.id}>#{o.tag}</Link>;
        })}
      </>
    );
  }

  return <></>;
}

// return a link for the next month
function nextMonth(date) {
  const d = date.add(1, "month");
  return monthNavLink(d, "Next");
}

// return a link to the previous month
function prevMonth(date) {
  const d = date.subtract(1, "month");
  return monthNavLink(d, "Prev");
}

function prevYear(date) {
  const d = date.subtract(1, "year");
  return monthNavLink(d, "Prev Year");
}

function nextYear(date) {
  const currentYear = new Date().getFullYear();

  if (date.year() !== currentYear) {
    const d = date.add(1, "year");
    return monthNavLink(d, "Next Year");
  }

  return <></>;
}
// return the nav link for the given data
function monthNavLink(date, str) {
  const month = date.month() + 1;
  const url = "/" + month + "/" + date.year();

  return <Link to={url}>{str}</Link>;
}
