import React from "react";
import NumberFormat from "react-number-format";

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

		NF(obj) {
				return (
						<NumberFormat
								value={obj}
								displayType={"text"}
								decimalScale={2}
								fixedDecimalScale={true}
						/>
				);
		}

		render() {
				if(this.state.isLoading === true || this.state.data === null) {
					return <h1>Weekly Report Loading...</h1>;
				}

				const data = this.state.data;
				return (
						<><table><caption>Weekly Report</caption>
								<thead><tr>
										<th>Name</th><th>Value</th>
								</tr></thead>
								<tbody>
										<tr><td>Target AUV</td><td>{data.TargetAUV}</td></tr>
										<tr><td>&nbsp;</td><td></td></tr>
										<tr><td>Sales Last Year</td><td>{this.NF(data.LastYearSales)}</td></tr>
										<tr><td>Sales This Week</td><td>{this.NF(data.NetSales)}</td></tr>
										<tr><td>Upcoming Sales</td><td>{this.NF(data.UpcomingSales)}</td></tr>
										<tr><td>&nbsp;</td><td></td></tr>
										<tr><td>Bread Plate Count</td><td>{this.NF(data.BreadOverShort)}</td></tr>
										<tr><td>Food Cost $</td><td>{this.NF(data.FoodCostAmount)}</td></tr>
										<tr><td>Labour Cost $</td><td>{this.NF(data.LabourCostAmount)}</td></tr>
										<tr><td>&nbsp;</td><td></td></tr>
										<tr><td>Customer Count</td><td>{this.NF(data.CustomerCount)}</td></tr>
										<tr><td>Customer Last Year</td><td>{this.NF(data.LastYearCustomerCount)}</td></tr>
										<tr><td>Party Sales</td><td>{this.NF(data.PartySales)}</td></tr>
										<tr><td>&nbsp;</td><td></td></tr>
										<tr><td>Target Hours</td><td>{this.NF(data.TargetHours)}</td></tr>
										<tr><td>&nbsp;</td><td></td></tr>
										<tr><td>Gift Card Sold</td><td>{this.NF(data.GiftCardSold)}</td></tr>
										<tr><td>Gift Card Redeem</td><td>{this.NF(data.GiftCardRedeem)}</td></tr>
										<tr><td>&nbsp;</td><td></td></tr>
									</tbody>
						</table></>

				);
		}
}

export default Weekly;
