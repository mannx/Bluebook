import {UrlGet, UrlApiTestFunction} from "../URLs";

async function handleClick() {
    const resp = await fetch(UrlGet(UrlApiTestFunction));
    const data = await resp.json();

    console.log(data);
}

export default function DebugPage() {
    return (
        <div>
            <button onClick={handleClick}>Test</button>
        </div>
    )
}