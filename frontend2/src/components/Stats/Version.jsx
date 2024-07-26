
import * as React from "react";
import { UrlGet, UrlVersion} from "../URLs";
import { Form, useLoaderData, Link } from "react-router-dom";
import ErrorOrData from "../Error.jsx";

export async function loader() {
    const resp = await fetch(UrlGet(UrlVersion));
    const json = await resp.json();

    return json;
}

export default function VersionInfo() {
    const data = useLoaderData();
    return ErrorOrData(data, displayVersion);
}

function displayVersion(data) {
    return (<>
        Commit Version: {data.Commit}
    </>)
}