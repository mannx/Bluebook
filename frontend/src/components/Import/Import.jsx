import React from "react";
import ImportControl from "./ImportControl.jsx";

// This contains everything to handle the import page

class Imports extends React.Component {

		dailyURL = "http://localhost:8080/api/import/daily";
		controlURL = "http://localhost:8080/api/import/control";
		wisrURL = "http://localhost:8080/api/import/wisr";
		wasteURL = "http://localhost:8080/api/import/waste";

		constructor(props) {
				super(props)

				this.state = {
						page: 0,		// 0 blank, 1-> daily, 2-> control, 3-> wisr, 4-> waste
				}
		}

		render() {
				switch(this.state.page) {
					case 0: return this.blank()
						case 1: return this.dailyImport();
						case 2: return this.controlImport();
						case 3: return this.wisrImport();
						case 4: return this.wasteImport();
						default: return (<>{this.blank()} <h1>Bad page #{this.state.page}</h1></>);
				}
		}

		blank() {
				return (<>
						<button onClick={this.dailies}>Import Dailies</button>
						<button onClick={this.control}>Import Control Sheet</button>
						<button onClick={this.wisr}>Import WISR</button>
						<button onClick={this.waste}>Import Waste</button>
				</>);
		}

		dailyImport = () =>
			{return (<>{this.blank()}<ImportControl URL={this.dailyURL} page={this.state.page} /></>);}

		controlImport = () => {
				return (<>{this.blank()}<ImportControl URL={this.controlURL} page={this.state.page}  /></>);
		}

		wisrImport = () => {
				return (<>{this.blank()}<ImportControl URL={this.wisrURL} page={this.state.page} /></>);
		}

		wasteImport = () => {
				return (<>{this.blank()}<ImportControl URL={this.wasteURL} page={this.state.page} /></>);
		}

		dailies = () => {console.log("dailies()"); this.setState({page: 1});}
		control = () => { console.log("control()"); this.setState({page: 2});}
		wisr = () => { console.log("wisr()"); this.setState({page: 3});}
		waste = () => { console.log("waste()"); this.setState({page: 4});}
}

export default Imports;
