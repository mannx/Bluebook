import {Form, useLoaderData, redirect} from "react-router-dom";

import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from "@mui/material/Box";

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import {UrlGet, GetPostOptions,
    UrlApi2ImportList,
    UrlApiImportDaily,
    UrlApiImportControl,
    UrlApiImportWISR,
} from "../URLs";

// TODO:
//   - allow uploading to server instead of picking local files?

function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        {...other}
        >
        {value === index && (
            <Box sx={{p: 3}}>
            <Typography>{children}</Typography>
            </Box>
        )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export async function loader() {
    const url = UrlGet(UrlApi2ImportList);
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}

// send the data to the server
export async function action({request }) {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);

    // flatten the object into an array of file names
    // each file name has a numeric key starting at 0
    // there is also the import key, remove the import key and flatten out
    const files = Object.keys(updates).map( (o) => {
        if(o === "import") { return; }
        return updates[o];
    }).filter( (o) => o !== undefined);

    // using the import key determine our api end point
    let url = "";
    switch(updates.import) {
        case "daily":
            url = UrlApiImportDaily;
            break;
        case "control":
            url = UrlApiImportControl;
            break;
        case "wisr":
            url=UrlApiImportWISR;
            break;
        default:
            throw new Error("Invalid import type");
    }

    const opt = GetPostOptions(JSON.stringify(files));
    await fetch(UrlGet(url), opt);

    return redirect("/import");
}

export default function Import() {
    const [value,setValue] = React.useState(0);
    const {data} = useLoaderData();

    const handleChange = (_, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider'}}>
        <Tabs value={value} onChange={handleChange}>
        <Tab label="Dailies" {...a11yProps(0)} />
        <Tab label="Control Sheet" {...a11yProps(1)} />
        <Tab label="WISR Sheet" {...a11yProps(2)} />
        </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
        {createForm("daily", data.Daily)}
        </TabPanel>
        <TabPanel value={value} index={1}>
        {createForm("control", data.Control)}
        </TabPanel>
        <TabPanel value={value} index={2}>
        {createForm("wisr", data.WISR)}
        </TabPanel>
        </Box>
    );
}

// create the form to select and submit the items to import
function createForm(id, entries) {
    return (
        <Form method="post" id={id}>

        <Stack direction="row" spacing={2}>
            <Button variant="contained" type="submit">Import</Button>
        </Stack>

        {(entries !== undefined && entries !== null) && entries.map( (e, i) => {
            return (<>
                <input type="checkbox" id={e} name={i} value={e} />
                <label for={e}>{e}</label><br/>
                </>);
        })}
        <input type="hidden" id="import" name="import" value={id}/>
        </Form>
    );
}
