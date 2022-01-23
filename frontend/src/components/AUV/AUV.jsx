import React from "react";
import DatePicker from "react-datepicker";
import AuvHandler from "./AuvHandler";

class AUV extends React.Component {

	constructor(props) {
			super(props);

			var d = new Date();
			this.state = {
					date: d,
			}
	}
	
	render() {
			return (
					<>
					<span>Pick month to view</span>
							<DatePicker selected={this.state.date} onChange={(d) => this.setState({date: d})} dateFormat="MM/yyyy" showMonthYearPicker showFullMonthYearPicker />
					<AuvHandler date={this.state.date}/>
					</>
			);
	}
}

export default AUV;
