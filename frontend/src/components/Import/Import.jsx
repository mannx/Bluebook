import React from "react";
import ImportControl from "./ImportControl.jsx";
import UrlGet from "../URLs/URLs.jsx";

// This contains everything to handle the import page

const dailyURL = UrlGet("Daily");
const controlURL = UrlGet("Control");
const wisrURL = UrlGet("WISR");
const wasteURL = UrlGet("Waste");

class Imports extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			page: 0,		// 0 blank, 1-> daily, 2-> control, 3-> wisr, 4-> waste
			result: null,
		}
	}

	render() {
		switch(this.state.page) {
			case 0: return this.blank()
			case 1: return (<>{this.blank()}<ImportControl URL={dailyURL} page={this.state.page} title="Daily Sheets" result={this.result}/> </>);
			case 2: return (<>{this.blank()}<ImportControl URL={controlURL} page={this.state.page}  title="Control Sheets" /></>);
			case 3: return (<>{this.blank()}<ImportControl URL={wisrURL} page={this.state.page} title="WISR"/></>);
			case 4: return (<>{this.blank()}<ImportControl URL={wasteURL} page={this.state.page} title="Waste Sheets"/></>);
			default: return (<>{this.blank()} <h1>Bad page #{this.state.page}</h1></>);
		}
	}

	blank() {
		return (<>
			{this.showMsg()}
			<button onClick={this.dailies}>Import Dailies</button>
			<button onClick={this.control}>Import Control Sheet</button>
			<button onClick={this.wisr}>Import WISR</button>
			<button onClick={this.waste}>Import Waste</button>
		</>);
	}

	dailies = () => {console.log("dailies()"); this.setState({page: 1});}
	control = () => { console.log("control()"); this.setState({page: 2});}
	wisr = () => { console.log("wisr()"); this.setState({page: 3});}
	waste = () => { console.log("waste()"); this.setState({page: 4});}

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

export default Imports;
