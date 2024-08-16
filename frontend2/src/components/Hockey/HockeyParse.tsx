import { useLoaderData } from "react-router-dom";
import {
  GetPostOptions,
  UrlApiHockeyRaw,
  UrlApiHockeyImport,
} from "../URLs.jsx";

import Button from "@mui/material/Button";

async function getRawData(url: string) {
  const opts = GetPostOptions(JSON.stringify(url));
  const resp = await fetch(UrlApiHockeyRaw, opts);
  const data = await resp.json();

  return { data };
}

interface HockeyData {
  Date: string;
  Away: string;
  Home: string;
  GFAway: number;
  GFHome: number;
  Attendance: number;
  Arena: string;
  AwayImage: string;
  HomeImage: string;
}

export default async function HockeyParse(url) {
  const raw = await getRawData(url);
  const d1 = JSON.parse(raw.data.Data);
  const data = JSON.parse(d1); // data is now a json object

  const arr: HockeyData[] = [];

  for (let i = 0; i < data.length; i++) {
    const d: HockeyData = data[i];

    const val: HockeyData = {
      Date: d[1][0],
      Away: d[2][1],
      AwayImage: d[2][0],
      Home: d[4][1],
      HomeImage: d[4][0],
      GFAway: d[3],
      GFHome: d[5],
      Attendance: d[7],
      Arena: d[9],
    };

    arr.push(val);
  }

  // runImport(arr);
  const opt = GetPostOptions(JSON.stringify(arr));
  const resp = await fetch(UrlApiHockeyImport, opt);
  const d = await resp.json();
}
//
// async function runImport(data: HockeyData[]) {
//   const opt = GetPostOptions(JSON.stringify(data));
//   const resp = await fetch(UrlApiHockeyImport, opt);
//   const d = await resp.json();
// }

