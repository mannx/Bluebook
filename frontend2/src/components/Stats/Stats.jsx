import Container from '@mui/material/Container';
import { useLoaderData } from 'react-router-dom';
import {UrlGet, UrlApi2AverageStats} from '../URLs';

export async function loader({params}){
    const url = UrlGet(UrlApi2AverageStats);
    const resp = await fetch(url);
    const data = await resp.json();

    return {data};
}
// display several different stats to start with
export default function SimpleStats() {
    const {data} = useLoaderData();

    return (<>
    <Container>
        <h3>Simple Stats</h3>
        <h3>Work In Progress</h3>
        <Container>
            <h3>Average Sale by day</h3>
            {data.map( (o) => {
                return (<>
                    <div>
                        <ul>Day Index: {o.Day}</ul>
                        <ul>Average: {o.NetSales}</ul>
                    </div>
                </>);
            })}
        </Container>
    </Container>
    </>);
}