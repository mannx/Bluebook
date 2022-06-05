import React from "react";
import TableView from "../../components/TableView/TableView.jsx";
import Imports from "../Import/Import.jsx";
import Wastage from "../Wastage/Wastage.jsx";
import Weekly from "../Weekly/Weekly.jsx";
import AUV from "../AUV/AUV.jsx";
import ViewTags from "../Tags/ViewTags.jsx";
import Top5 from "../Top5/Top5.jsx";
import Settings from "../Settings/Settings.jsx";
import "./header.css";

//
// This is used to provide navigation between the data we are viewing
// and any other pages
//

function NavButton(props) {
	return (
		<span className={"navLink"} onClick={props.func}> {props.name}</span>
	);
}

const PageMonth = 1;
const PageImport = 2;
const PageWastage = 3;
const PageWeekly = 4;
const PageAUV = 5;
const PageTags = 6;
const PageTop5 = 7;
const PageSettings = 10;

function Navigate(props) {
	switch(props.page) {
		case PageMonth:
			return <TableView month={props.month} year={props.year} navTag={props.navTag} />;
		case PageImport:
			return <Imports />;
		case PageWastage:
			return <Wastage />;
		case PageWeekly:
			return <Weekly />;
		case PageAUV:
			return <AUV />;
		case PageTags:
			return <ViewTags />;
		case PageTop5:
			return <Top5 />;
		case PageSettings:
			return <Settings/>;
		default:
			return <h2>Invalid page number {props.page}</h2>;
	}
}

export default class Navigation extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			// make sure month and year are both considered integers
			month: parseInt(props.month), 
			year: parseInt(props.year),
			page: PageMonth,
		};

		this.NavigatePrev = this.NavigatePrev.bind(this);
		this.NavigateNext = this.NavigateNext.bind(this);
		this.funcToday = this.funcToday.bind(this);
	}

	render() {
		let nav;
		if(this.state.page === PageMonth) {
			// show related navigation optioons
			nav = (<>
				<li className={"navControl"}><NavButton name={"Prev"} func={this.NavigatePrev} /></li>
				<li className={"navControl"}><NavButton name={"Next"} func={this.NavigateNext} /></li>
				<li className={"navControl"}><NavButton name={"Prev Year"} func={this.NavigatePrevYear} /></li>
			</>);
		}else{
			nav = <></>;
		}

		return (
			<>
			<div><ul className={"navControl"}>
				{nav}
				<li className={"navControl"}><NavButton name={"Today"} func={this.funcToday} /></li>
				<li className={"navControl"}><NavButton name={"Search Tags"} func={this.NavigateTags} /></li>
				<li className={"navControl"}><NavButton name={"AUV"} func={this.NavigateAUV} /></li>
				<li className={"navControl"}><NavButton name={"Weekly Info"} func={this.NavigateWeekly} /></li>
				<li className={"navControl"}><NavButton name={"Wastage"} func={this.NavigateWastage} /></li>
				<li className={"navControl"}><NavButton name={"Top 5"} func={this.NavigateTop5} /></li>
				<li className={"navControl"}><NavButton name={"Import"} func={this.Imports} /></li>
				<li className={"navControl"}><NavButton name={"Settings"} func={this.Settings} /></li>
			</ul></div>
			<Navigate month={this.state.month} year={this.state.year} page={this.state.page} navTag={this.NavigateTags} />
			</>
		);
	}

	funcToday() {
		this.setState({page: PageMonth});

		let d = new Date();
		this.setState({month: d.getMonth()+1, year: d.getFullYear()});
	}

	NavigatePrev() {
		var m = this.state.month;
		var y = this.state.year;

		if(m === 1) {
			y = y - 1;
			m = 12;
		}else{
			m = m - 1;
		}

		this.setState({month: m, year: y});
	}

	NavigateNext() {
		var m = this.state.month;
		var y = this.state.year;

		if(m === 12){
				y = y + 1;
				m = 1;
		}else{
				m = m + 1;
		}

		this.setState({month: m, year: y});
	}

	Imports = () => {this.setState({page: PageImport});}
	NavigatePrevYear = () => {this.setState({year: this.state.year-1})}
	NavigateWastage = () => { this.setState({page: PageWastage});}
	NavigateWeekly = () => { this.setState({page: PageWeekly});}
	NavigateAUV = () => { this.setState({page: PageAUV});}
	NavigateTags = () => { this.setState({page: PageTags});}
	NavigateTop5 = () => { this.setState({page: PageTop5});}
	Settings = () => { this.setState({page: PageSettings});}
}
