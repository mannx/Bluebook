import React from "react";
import NumberFormat from "react-number-format";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const formatUTC = (dateInt, addOffset = false) => {
		let date=(!dateInt||dateInt.length<1)?new Date():new Date(dateInt);
		if (typeof dateInt === "string"){
				return date;
		}else{
				const offset=addOffset?date.getTimezoneOffset():-(date.getTimezoneOffset());
				const offsetDate=new Date();
				offsetDate.setTime(date.getTime()+offset*60000);
				return offsetDate;
		}
}

class Weekly extends React.Component {
		constructor(props) {
				super(props);

				this.state = { 
						data: null,
						isLoading: true,
						date: new Date(2022, 0, 4, 0, 0, 0, 0),
				}
		}
		

		loadData = async () => {
				if(this.state.date == null) {
						return;
				}

				const month=this.state.date.getMonth()+1;
				const day = this.state.date.getDate();
				const year = this.state.date.getFullYear();

				const url = "http://localhost:8080/api/weekly/view?month="+month+"&day="+day+"&year="+year;
				const resp = await fetch(url);
				const data = await resp.json();

				console.log("Weekly");
				console.log(this.state.date);
				console.log(data);

				this.setState({data: data, isLoading: false});
		}	

		componentDidMount() {
				this.loadData();
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

		D(obj) {
				return (<span>
						{obj.getMonth()+1} / {obj.getDate()} / {obj.getFullYear()}
				</span>
				);
		}

		header = () => {
				return (<>
						<span>Pick Week To View:</span>
						<DatePicker selected={this.state.date} onChange={(e)=>this.setState({date:e})} />
						<button onClick={this.updateView}>View</button>
				</>
				);
		}

		updateView = () => {
				console.log(this.state.date);
				this.loadData();
		}

		render() {
				if(this.state.isLoading === true || this.state.data === null) {
					return <h1>Weekly Report Loading...</h1>;
				}

				const data = this.state.data;
				return (
						<>
						<span>Week Ending: {this.D(this.state.date)}</span>
						{this.header()}
						<table><caption>Weekly Report</caption>
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
