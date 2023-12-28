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

    const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    return (<>
    <Container>
        <h3>Simple Stats</h3>
        <h3>Work In Progress</h3>
        <Container>
            <h3>Average Sale by day</h3>
            <table>
                <tr>
                    <th></th>
                    <th>Day</th>
                    <th>Average</th>
                </tr>
            {data.map( (o, i) => {
                return (<tr>
                    <td>{i}</td>
                    <td>{dayNames[o.Day]}</td>
                    <td>{o.NetSales}</td>
                </tr>);
                // return (<>
                //     <div>
                //         <ul>Day Index: {o.Day}</ul>
                //         <ul>Average: {o.NetSales}</ul>
                //     </div>
                // </>);
            })}
            </table>
        </Container>
    </Container>
    </>);
}