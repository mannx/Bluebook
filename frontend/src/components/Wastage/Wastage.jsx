import React from "react";
import NumberFormat from "react-number-format";
import DatePicker from "react-datepicker";
import UrlGet from "../URLs/URLs.jsx";

import "react-datepicker/dist/react-datepicker.css";

class Wastage extends React.Component {
		constructor(props) {
				super(props);

				var d = new Date();

				if(d.getDay() === 3) {
						d.setDate(d.getDate()-1);
				}

				this.state = {
						date: d,
						data: null,
						errorMsg: "",
						error: false,
				}

				// if not a tuesday, display an error 
				/*if(this.state.date.getDay() !== 2) {
						this.setState({error: true, errorMsg: "Require date to be a tuesday"});
				}*/
		}

		loadData = async () => {
				if(this.state.date == null || this.state.error === true) return;

				const month = this.state.date.getMonth()+1;
				const year = this.state.date.getFullYear();
				const day = this.state.date.getDate();

				const url = UrlGet("WasteView") + "?month="+month+"&year="+year+"&day="+day;
				const resp = await fetch(url);
				const data = await resp.json();

				this.setState({data: data});
		}

		header = () => {
				return (
						<div><span>Pick Week To View:</span>
								<DatePicker selected={this.state.date} onChange={(d)=>this.setState({date:d})} />
								<button onClick={this.updateView}>View</button>
								<div>{this.state.errorMsg}</div>
						</div>);
		}

		updateView = () => {
				//
				// if not a tuesday, display an error 
				if(this.state.date.getDay() !== 2) {
						this.setState({error: true, errorMsg: "Require date to be a tuesday"});
						return;
				}else{
						// make sure the error is cleared
						this.setState({error: false, errorMsg: ""});
				}

				this.loadData();
		}

		render() {
				if(this.state.data == null){
						return (<>{this.header()}<h1>Loading</h1></>);
				}

				const month = this.state.date.getMonth()+1;
				const year = this.state.date.getFullYear();
				const day = this.state.date.getDate();

				return (<>
						{this.header()}
						<table>
								<caption>Waste for {month}/{day}/{year}</caption>
								<thead>
										<tr>
											<th>Item</th>
											<th>Weight</th>
										</tr>
								</thead>
								<tbody>
								{this.state.data.Data.map(function (obj, i) {
										if(obj.Name !== ""){
											return (<tr>
													<td>{obj.Name}</td>
													<td>{this.NF(obj.Amount)}</td>
													</tr>
											);
										}else{
											return (<tr><td>&nbsp;</td><td>&nbsp;</td></tr>);
										}
								}, this)}
								</tbody>
						</table>
						</>);
		}

		NF = (obj) => {
				return (
						<NumberFormat
						value={obj}
						displayType={"text"}
						thousandSeparator={true}
						decimalScale={2}
						fixedDecimalScale={true}
						/ >
				);
		}

}


export default Wastage;
