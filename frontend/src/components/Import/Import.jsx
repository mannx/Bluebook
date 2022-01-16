import React from "react";
import Daily from "./Daily.jsx";

// This contains everything to handle the import page

class Imports extends React.Component {
		constructor(props) {
				super(props)

				this.state = {
						page: 0,		// 0 blank, 1-> daily, 2-> control, 3-> wisr
				}

				this.dailies = this.dailies.bind(this);
				this.control = this.control.bind(this);
				this.wisr = this.wisr.bind(this);

				this.dailyImport = this.dailyImport.bind(this);
		}

		render() {
				switch(this.state.page) {
					case 0: return this.blank()
						case 1: return this.dailyImport();
						case 2: return (<>{this.blank()} <h1>Control sheet</h1></>);
						case 3: return (<>{this.blank()} <h1>Wisr</h1></>);
						default: return (<>{this.blank()} <h1>Bad page #{this.state.page}</h1></>);
				}
		}

		blank() {
				return (<>
						<button onClick={this.dailies}>Import Dailies</button>
						<button onClick={this.control}>Import Control Sheet</button>
						<button onClick={this.wisr}>Import WISER</button>
				</>);
		}

		dailyImport() {
				return (<>{this.blank()}<Daily /></>);
		}

		dailies() {this.setState({page: 1});}
		control() { this.setState({page: 2});}
		wisr() { this.setState({page: 3});}
}

export default Imports;
