import { useLoaderData } from "react-router-dom";
import { UrlApiHockeyRaw } from "../URLs.jsx";

export async function loader() {
  const resp = await fetch(UrlApiHockeyRaw);
  const data = await resp.json();

  return { data };
}

export default function HockeyParse() {
  const raw = useLoaderData();
  const d1 = JSON.parse(raw.data.Data);
  const data = JSON.parse(d1);  // data is now a json object

  return <>Parsing data here</>;
}
