import React from "react";
import ImportControl from "./ImportControl.jsx";
import UrlGet from "../URLs/URLs.jsx";

// This contains everything to handle the import page

const dailyURL = UrlGet("Daily");
const controlURL = UrlGet("Control");
const wisrURL = UrlGet("WISR");
const wasteURL = UrlGet("Waste");

// navigation pages to display items to import
const PageBlank = 0;
const PageDaily = 1;
const PageControl = 2;
const PageWISR = 3;
const PageWaste = 4;

export default class Imports extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			page: PageBlank,
			result: null,
		}
	}

	render() {
		return (<>
			{this.nav()}
			<ImportControl URL={dailyURL} title="Daily Sheets" visible={this.state.page === PageDaily} result={this.result} />
			<ImportControl URL={controlURL} title="Control Sheets" visible={this.state.page === PageControl} result={this.result} />
			<ImportControl URL={wisrURL} title="WISR" visible={this.state.page === PageWISR} result={this.result} />
			<ImportControl URL={wasteURL} title="Waste Sheets" visible={this.state.page === PageWaste} result={this.result} />
		</>);
	}

	nav() {
		return (<>
			<button onClick={this.dailies}>Import Dailies</button>
			<button onClick={this.control}>Import Control Sheet</button>
			<button onClick={this.wisr}>Import WISR</button>
			<button onClick={this.waste}>Import Waste</button>
			<br/>{this.showMsg()}
		</>);
	}

	dailies = () => {this.setState({page: PageDaily});}
	control = () => { this.setState({page: PageControl});}
	wisr = () => { this.setState({page: PageWISR});}
	waste = () => { this.setState({page: PageWaste});}

	result = (msg) => {
		this.setState({result: msg});
	}

	showMsg = () => {
		if(this.state.result !== null ) {
			return <span className="info">{this.state.result}</span>;
		}
		return null;
	}
}
