import React from "react";

class Weekly extends React.Component {
		constructor(props) {
				super(props);

				this.state = {
						data: null,
						isLoading: true,
						month: 1,
						year: 2022,
						day: 4,
				}
		}

		async componentDidMount() {
				const month=this.state.month;
				const day = this.state.day;
				const year = this.state.year;

				const url = "http://localhost:8080/api/weekly/view?month="+month+"&day="+day+"&year="+year;
				const resp = await fetch(url);
				const data = await resp.json();

				console.log("Weekly");
				console.log(data);

				this.setState({data: data, isLoading: false});
		}

		render() {
				if(this.state.isLoading === true || this.state.data === null) {
					return <h1>Weekly Report Loading...</h1>;
				}

				return (
						<><table><caption>Weekly Report</caption>
								<thead><tr>
										<th>Name</th><th>Value</th>
								</tr></thead>
								<tbody>
										<tr>
												<td>Target AUV</td><td></td>
										</tr>
									</tbody>
						</table></>

				);
		}
}

export default Weekly;
