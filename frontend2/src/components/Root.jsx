import {Outlet, NavLink} from "react-router-dom";
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
    // return (
    //     <Link className="navLink" to={props.url}>{props.name}</Link>
    // );
    return (
        <NavLink to={props.url} className={({isActive, isPending}) => isPending ? "pending" : isActive ? "active" : ""}>{props.name}</NavLink>
    );
}

function navHeader() {
    return (
        <div className="no-print"><ul className={"navControl"}>
        <li className={"navControl"}><NavButton url="/today" name="Today"/></li>
        <li className={"navControl"}><NavButton url="/" name="Search Tags" /></li>
        <li className={"navControl"}><NavButton url="/" name="AUV" /></li>
        <li className={"navControl"}><NavButton url="/weekly" name="Weekly Info" /></li>
        <li className={"navControl"}><NavButton url="/" name="Wastage" /></li>
        <li className={"navControl"}><NavButton url="/" name="Top 5" /></li>
        <li className={"navControl"}><NavButton url="/import" name="Import" /></li>
        <li className={"navControl"}><NavButton url="/" name="Waste Settings" /></li>
        <li className={"navControl"}><NavButton url="/" name="Waste Input" /></li>
        </ul>
        </div>
    );
}
