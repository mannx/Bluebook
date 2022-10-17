import React from "react";
import NumberFormat from "react-number-format";
import DatePicker from "react-datepicker";
import {UrlGet, GetPostOptions} from "../URLs/URLs.jsx";

import "react-datepicker/dist/react-datepicker.css";

export default class Wastage extends React.Component {
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

			shown: false,			// have we shown waste for a day yet? require before export
		}
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
				<button onClick={this.exportWaste}>Export</button>
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

		// mark that we have shown a wastage day
		this.setState({shown: true});
	}

	exportWaste = () => {
		// make sure a day has been viewed before we try and export
		if(this.state.shown !== true) {
			this.setState({error: true, errorMsg: "View data before exporting"});
			return;
		}

		// get the end of week date
		const month=this.state.date.getMonth()+1;
		const day = this.state.date.getDate();
		const year = this.state.date.getFullYear();

		const body = {
			Month: month,
			Day: day,
			Year: year,
		}

		const options = GetPostOptions(JSON.stringify(body));

		fetch(UrlGet("WasteExport"), options);
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
					<th>Unit</th>
					<th>Location</th>
				</tr>
				</thead>
				<tbody>
				{this.state.data.Data.map(function (obj, i) {
					if(obj.Name !== ""){
						return (<tr>
								<td>{obj.Name}</td>
								<td>{this.NF(obj.Amount)}</td>
								<td>{obj.UnitOfMeasure}</td>
								<td>{obj.LocationString}</td>
								</tr>
						);
					}else{
						return (<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>);
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
