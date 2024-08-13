import { useLoaderData } from "react-router-dom";
import { UrlApiHockeyRaw } from "../URLs.jsx";

export async function loader() {
  const resp = await fetch(UrlApiHockeyRaw);
  const data = await resp.json();

  return { data };
}

export default function HockeyParse() {
  const raw = useLoaderData();
  const data = JSON.parse(raw.data.Data);

  return <>Parsing data here</>;
}
