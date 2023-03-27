
// this page provides a date picker to validate a week ending date
import * as React from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {Link, Outlet, useNavigate} from "react-router-dom";

// true if day is not a tuesday to disable in the picker
// avoid picking unusable dates and needing an error message
const notTuesday = (date) => {
    return date.day() !== 2;
}

// pick our week ending, display error if not a tuesday
export default function WeeklyNav() {
    const [date, setDate] = React.useState(null);
    const navigate = useNavigate();

    // if we have a selected date, get its values and pull in the weekly data
    let url = null;
    if(date !== null) {
        const day = date.date();
        const month = date.month() + 1; // month is 0 based
        const year = date.year();

        url = "/weekly/"+day+"/"+month+"/"+year;
        console.log(url);
    }

    return (<>
        <DatePicker value={date} onChange={(e) => setDate(e)} shouldDisableDate={notTuesday}/>
        {url !== null ?
            <Link to={url}>Load</Link>
            : <></>
        }
        <div><Outlet/></div>
        </>
    );
}
