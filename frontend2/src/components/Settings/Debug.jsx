import * as react from 'react';

import {DatePicker} from '@mui/x-date-pickers/DatePicker';

import dayjs from 'dayjs';

export default function DebugSettings() {
    const [value, setValue] = react.useState(null);

    const day=getDate();

    return (<>
        <h3>Debug Settings</h3>
        <DatePicker value={value} onChange={(nv)=>setValue(nv)} defaultValue={dayjs(day)}/>
        </>);
}

function getDate() {
    const now=new Date();
    const day = now.getDay();

    console.log("day = "+day);

    // find the closest wednesday
    let offset = 0;
    if(day == 3) {
        // already wednesday, skip
    }else if(day >= 4){
        // move back
        offset = day - 3;
    }else{
        // move up to the next wed
        offset = day + 3;
    }
    
    console.log("offset = " + offset);

    // return <div>Day is: {day}</div>;
    const start = dayjs();
    return start.add(-offset, 'day');
}
