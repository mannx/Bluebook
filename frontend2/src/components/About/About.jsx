import { useLoaderData, Form } from "react-router-dom";

import { UrlAbout } from "../URLs.jsx";
import ErrorOrData from "../Error.jsx";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export async function loader() {
  const resp = await fetch(UrlAbout);
  const data = await resp.json();

  return { data };
}

export default function AboutPage() {
  const { data } = useLoaderData();

  const output = ErrorOrData(data, (d) => {
    return <>Version: {d.Branch}-{d.Commit}</>
  });

  return (
    <>
      <Box>
        <Typography variant="h3">About</Typography>
        {output}
      </Box>
    </>
  );
}
