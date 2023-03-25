import {useLoaderData} from "react-router-dom";

export async function loader({params}) {
    const data = {
        month: params.month,
        year: params.year,
    };

    return {data};
}

export default function MonthView() {
    const {data} = useLoaderData();

    return (
        <div>
        <h1>Month View for {data.month}/{data.year}</h1>
        </div>
    );
}
