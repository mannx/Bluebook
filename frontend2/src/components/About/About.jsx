import { useLoaderData, Form } from "react-router-dom";

import { UrlAbout } from "../URLs.jsx";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export async function loader() {
  const resp = await fetch(UrlAbout);
  const data = await resp.json();

  return { data };
}

export default function AboutPage() {
  const { data } = useLoaderData();

  return (
    <>
      <Box>
        <Typography variant="h3">About</Typography>
        Version: {data.Branch}-{data.Commit}
      </Box>
    </>
  );
}
