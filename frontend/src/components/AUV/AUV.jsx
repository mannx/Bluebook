import React from "react";
import DatePicker from "react-datepicker";
import AuvHandler from "./AuvHandler";

class AUV extends React.Component {

	constructor(props) {
			super(props);

			var d = new Date();
			this.state = {
					year: d.getFullYear(),
					month: d.getMonth(),
					date: d,
			}

			console.log("month: "+ this.state.month);
			console.log("year: "+this.state.year);
	}
	
	render() {
			//<DatePicker selected={this.state.date} onChange={(d) => this.setState({month: d.getMonth(), year: d.getFullYear(), date: d})} dateFormat="MM/yyyy" showMonthYearPicker showFullMonthYearPicker />
			return (
					<>
					<span>Pick month to view</span>
							<DatePicker selected={this.state.date} onChange={(d) => this.setState({date: d})} dateFormat="MM/yyyy" showMonthYearPicker showFullMonthYearPicker />
					<AuvHandler date={this.state.date}/>
					</>
			);
	}

		update = (d) => {
				console.log("saving date: "+ d);
				//this.setState({month: d.getMonth(), year: d.getFullYear(), date: new Date(d.getFullYear(),d.getMonth(),1, 0, 0, 0, 0)});
		}
}

export default AUV;
