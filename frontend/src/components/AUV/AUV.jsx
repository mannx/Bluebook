import React from "react";

class AUV extends React.Component {

	constructor(props) {
			super(props);
			
			this.state = {
					data: null,
					loading: true,
					month: 12,
					year: 2021,
					auv: [],
			}
	}

	async componentDidMount() {
			const url ="http://localhost:8080/api/auv/view?month="+this.state.month+"&year="+this.state.year;
			const resp = await fetch(url);
			const data = await resp.json();

			console.log(data);
			this.setState({data: data, loading: false});
	}

	render() {
			if(this.state.loading || this.state.data == null) {
					return <h1>AUV data loading...</h1>;
			}

			return (
					<>
					<table><caption>AUV for __</caption>
							<thead><tr>
									<th>Week Ending</th>
									<th>AUV</th>
									<th>Hours</th>
							</tr></thead>
							<tbody>
									<tr>
											<td>DATE PICKER</td><td>{this.inputField(this.state.data.Week1AUV)}</td><td>NUMBER INPUT</td>
									</tr>
							</tbody>
					</table>
					<button onClick={this.updateAUV}>Save</button>
					</>
			);
	}
		
	updateAUV = () => {
		console.log("w1 auv");
			console.log(this.state.auv[1]);
	}
	
	inputField = (v, i) => {
			return (
					<input type={"number"} defaultValue={v} />
			);
	}
}

export default AUV;
