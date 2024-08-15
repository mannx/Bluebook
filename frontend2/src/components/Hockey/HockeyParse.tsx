import { useLoaderData } from "react-router-dom";
import { GetPostOptions, UrlApiHockeyRaw, UrlApiHockeyImport} from "../URLs.jsx";

import Button from "@mui/material/Button";

export async function loader() {
  const resp = await fetch(UrlApiHockeyRaw);
  const data = await resp.json();

  return { data };
}

interface HockeyData {
  Date: string;
  Away: string;
  Home: string;
  GFAway: number;
  GFHome: number;
  Attendance:number;
  Arena: string;
  AwayImage: string;
  HomeImage: string;
}

export default function HockeyParse() {
  const raw = useLoaderData();
  const d1 = JSON.parse(raw.data.Data);
  const data = JSON.parse(d1);  // data is now a json object

  const arr:HockeyData[]=[];

  for(let i = 0; i< data.length; i++){
    const d:HockeyData = data[i];

    if(d[0] == "591"){
      console.log("breakpoint");
    }

    const val:HockeyData={
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

  return <>
    <Button variant="contained" onClick={()=>{runImport(arr)}}>Import</Button>
      <br/>  
    {arr.map( (n:HockeyData) => {
      return <>
      Date: {n.Date}<br/>
      Home: {n.Home} -- {n.GFHome} <br/>
      Away: {n.Away} -- {n.GFAway}<br/>
      Attendance: {n.Attendance}<br/>
      Arena: {n.Arena}<br/>
      <br/>
      </>
    })}    
    </>;
}

async function runImport(data: HockeyData[]) {
  const opt = GetPostOptions(JSON.stringify(data));
  const resp = await fetch (UrlApiHockeyImport,opt);
  const d = await resp.json();

}