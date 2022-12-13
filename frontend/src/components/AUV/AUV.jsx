import React from "react";
import DatePicker from "react-datepicker";
import NumericInput from "react-numeric-input";
import UrlGet from "../URLs/URLs.jsx";
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

export default class AUV extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			loading: true,

			week1date: null,
			week2date: null,
			week3date: null,
			week4date: null,
			week5date: null,

			week1hours: null,
			week2hours: null,
			week3hours: null,
			week4hours: null,
			week5hours: null,

			week1auv: null,
			week2auv: null,
			week3auv: null,
			week4auv: null,
			week5auv: null,

			id: 0,

			date: new Date()
		}

	}

	//async componentDidMount() {
	loadData = async (month, year) => {
		const url =UrlGet("AUV") + "?month="+month+"&year="+year;
		const resp = await fetch(url);
		const data = await resp.json();

		const d1 = new Date(data.Week1Date.replace("T00:00:00Z",""));
		const d2 = new Date(data.Week2Date.replace("T00:00:00Z",""));
		const d3 = new Date(data.Week3Date.replace("T00:00:00Z",""));
		const d4 = new Date(data.Week4Date.replace("T00:00:00Z",""));
		const d5 = new Date(data.Week5Date.replace("T00:00:00Z",""));

		this.setState({week1date: formatUTC(d1, true)});
		this.setState({week2date: formatUTC(d2, true)});
		this.setState({week3date: formatUTC(d3, true)});
		this.setState({week4date: formatUTC(d4, true)});
		this.setState({week5date: formatUTC(d5, true)});

		this.setState({week1hours: data.Week1Hours});
		this.setState({week2hours: data.Week2Hours});
		this.setState({week3hours: data.Week3Hours});
		this.setState({week4hours: data.Week4Hours});
		this.setState({week5hours: data.Week5Hours});

		this.setState({week1auv: data.Week1AUV});
		this.setState({week2auv: data.Week2AUV});
		this.setState({week3auv: data.Week3AUV});
		this.setState({week4auv: data.Week4AUV});
		this.setState({week5auv: data.Week5AUV});

		this.setState({id: data.ID});
		this.setState({loading: false});
	}

	componentDidMount() {
		const month = this.state.date.getMonth()+1;
		const year= this.state.date.getFullYear();

		this.loadData(month, year);
	}

	header = () => {
		return ( <>
			<span>Pick month to view</span>
			<DatePicker selected={this.state.date} onChange={(e) => {this.dateUpdate(e)}} dateFormat="MM/yyyy" showMonthYearPicker showFullMonthYearPicker />
			<button onClick={this.loadData}>View</button>
		</>);
	}

	dateUpdate = (e) => {
		// update the date and reload the data
		this.setState({date: e});

		const month = e.getMonth()+1;
		const year = e.getFullYear();
		this.loadData(month, year);
	}

	render() {
		if(this.state.loading) {
			return (<>{this.header()}<h1>AUV data loading...</h1></>);
		}

		return (
			<>{this.header()}
			<table><caption>AUV for __</caption>
				<thead><tr>
					<th>Week Ending</th>
					<th>AUV</th>
					<th>Hours</th>
				</tr></thead>
				<tbody>
					<tr>
					<td><DatePicker selected={this.state.week1date} value={this.state.week1date} onChange={(d) => this.setState({week1date: d})} /></td>
						<td><NumericInput value={this.state.week1auv} strict min={0} onChange={(n,s,i) => {this.setState({week1auv: n})}} /></td>
						<td><NumericInput value={this.state.week1hours} strict min={0} onChange={(n,s,i) => {this.setState({week1hours: n})}}/></td>
					</tr>
					<tr>
					<td><DatePicker selected={this.state.week2date} onChange={(d) => this.setState({week2date: d})} /></td>
						<td><NumericInput value={this.state.week2auv} strict min={0} onChange={(n,s,i) => {this.setState({week2auv: n})}} /></td>
						<td><NumericInput value={this.state.week2hours} strict min={0} onChange={(n,s,i) => {this.setState({week2hours: n})}}/></td>
					</tr>
					<tr>
					<td><DatePicker selected={this.state.week3date} onChange={(d) => this.setState({week3date: d})} /></td>
						<td><NumericInput value={this.state.week3auv} strict min={0} onChange={(n,s,i) => {this.setState({week3auv: n})}} /></td>
						<td><NumericInput value={this.state.week3hours} strict min={0} onChange={(n,s,i) => {this.setState({week3hours: n})}}/></td>
					</tr>
					<tr>
					<td><DatePicker selected={this.state.week4date} onChange={(d) => this.setState({week4date: d})} /></td>
						<td><NumericInput value={this.state.week4auv} strict min={0} onChange={(n,s,i) => {this.setState({week4auv: n})}} /></td>
						<td><NumericInput value={this.state.week4hours} strict min={0} onChange={(n,s,i) => {this.setState({week4hours: n})}}/></td>
					</tr>
					<tr>
					<td><DatePicker selected={this.state.week5date} onChange={(d) => this.setState({week5date: d})} /></td>
						<td><NumericInput value={this.state.week5auv} strict min={0} onChange={(n,s,i) => {this.setState({week5auv: n})}} /></td>
						<td><NumericInput value={this.state.week5hours} strict min={0} onChange={(n,s,i) => {this.setState({week5hours: n})}}/></td>
					</tr>
				</tbody>
			</table>
			<button onClick={this.updateAUV}>Save</button>
			</>
		);
	}
		
	updateAUV = () => {
		const options = {
			method: 'POST',
			headers: {'Content-Type':'application/json'},
			body: JSON.stringify(this.state)
		};

		fetch(UrlGet("AUVUpdate"), options)
			.then(r=>console.log(r));
	}
}
