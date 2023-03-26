import {Outlet, Link} from "react-router-dom";
import "./header.css";

export default function Root() {
    return (
        <>
        {navHeader()}
        <div><Outlet /></div>
        </>
    );
}

function NavButton(props) {
    return (
        <Link className="navLink" to={props.url}>{props.name}</Link>
    );
}

function navHeader() {
    return (
        <div className="no-print"><ul className={"navControl"}>
        <li className={"navControl"}><NavButton url="/today" name="Today"/></li>
        <li className={"navControl"}><NavButton name="Search Tags" /></li>
        <li className={"navControl"}><NavButton name="AUV" /></li>
        <li className={"navControl"}><NavButton name="Weekly Info" /></li>
        <li className={"navControl"}><NavButton name="Wastage" /></li>
        <li className={"navControl"}><NavButton name="Top 5" /></li>
        <li className={"navControl"}><NavButton name="Import" /></li>
        <li className={"navControl"}><NavButton name="Waste Settings" /></li>
        <li className={"navControl"}><NavButton name="Waste Input" /></li>
        </ul>
        </div>
    );
}
