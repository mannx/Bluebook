import {redirect} from "react-router-dom";


export async function loader() {
    const d = new Date();
    const url = "/"+(d.getMonth()+1)+"/"+d.getFullYear();

    console.log("root loader redirect to " + url);
    return redirect(url);
}


export default function Root() {
    return (
        <>
        <h1>Bluebook Helper Frontend v2</h1>
        <span>Loading current month</span>
        </>
    );
}
