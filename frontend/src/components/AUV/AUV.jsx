import React from "react";
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

class AUV extends React.Component {

	constructor(props) {
			super(props);
			
			this.state = {
					data: null,
					loading: true,
					month: 12,
					year: 2021,
					auv: new Map(),
					hours: [],
					date: new Map(),
			}

	}

	async componentDidMount() {
			const url ="http://localhost:8080/api/auv/view?month="+this.state.month+"&year="+this.state.year;
			const resp = await fetch(url);
			const data = await resp.json();

			this.setState({data: data});
			console.log(data);

			this.state.date.set(1, new Date(this.state.data.Week1Date.replace("T00:00:00Z","")));
			console.log("date[1]");
			console.log(this.state.date.get(1));

			this.setState({loading: false});
	}

	render() {
			if(this.state.loading) {
					return <h1>AUV data loading...</h1>;
			}else if (this.state.data == null){
					return <h1>Data null</h1>;
			}else if(this.state.date == null) {
					return <h1>Date is null! </h1>;
			}

			//var w1d = new Date(this.state.data.Week1Date.replace("T00:00:00Z",""));
			//var w1d = this.state.date.get(1);
			var w2d = new Date(this.state.data.Week2Date.replace("T00:00:00Z",""));
			var w3d = new Date(this.state.data.Week3Date.replace("T00:00:00Z",""));
			var w4d = new Date(this.state.data.Week4Date.replace("T00:00:00Z",""));
			var w5d = new Date(this.state.data.Week5Date.replace("T00:00:00Z",""));

			return (
					<>
					<table><caption>AUV for __</caption>
							<thead><tr>
									<th>Week Ending</th>
									<th>AUV</th>
									<th>Hours</th>
									<th></th>
							</tr></thead>
							<tbody>
									<tr><td><DatePicker selected={formatUTC(this.state.date.get(1), true)} onChange={this.dateChange} /></td><td>{this.inputAuv(this.state.data.Week1AUV, 1)}</td><td>{this.inputHours(this.state.data.Week1Hours, 1)} </td><td></td></tr>
			<tr><td><DatePicker selected={formatUTC(w2d, true)} onChange={this.dateChange} /></td><td>{this.inputAuv(this.state.data.Week2AUV, 2)}</td><td>{this.inputHours(this.state.data.Week2Hours, 2)} </td><td></td></tr>
			<tr><td><DatePicker selected={formatUTC(w3d, true)} onChange={this.dateChange} /></td><td>{this.inputAuv(this.state.data.Week3AUV, 3)}</td><td>{this.inputHours(this.state.data.Week3Hours, 3)} </td><td></td></tr>
			<tr><td><DatePicker selected={formatUTC(w4d, true)} onChange={this.dateChange} /></td><td>{this.inputAuv(this.state.data.Week4AUV, 4)}</td><td>{this.inputHours(this.state.data.Week4Hours, 4)} </td><td></td></tr>
			<tr><td><DatePicker selected={formatUTC(w5d, true)} onChange={this.dateChange} /></td><td>{this.inputAuv(this.state.data.Week5AUV, 5)}</td><td>{this.inputHours(this.state.data.Week5Hours, 5)} </td><td></td></tr>
							</tbody>
					</table>
					<button onClick={this.updateAUV}>Save</button>
					</>
			);
	}
		
	dateChange = (d, i) => {
			//this.setState({date: d});
			this.state.date.set(i, d);
			console.log(this.state.date.get(i));
	}

	updateAUV = () => {
		console.log("w1 auv");
			console.log(this.state.auv.get(1));
	}
	
	auvChange = (e, i) => {
			//this.state.auv[i] = e.target.value;
			//
			this.state.auv.set(i,e.target.value);
			console.log("auv["+i+"] = " + this.state.auv.get(i));
	}

	hoursChange = (e, i) => {
			//this.state.hours[i] = e.target.value;
	}

	inputAuv = (v, i) => {
			return (
					<input type={"number"} defaultValue={v} onChange={(e) => this.auvChange(e, i)}/>
			);
	}

	inputHours = (v, i) => {
			return (
					<input type={"number"} defaultValue={v} onChange={(e) => this.hoursChange(e,i)} />
			);
	}
}

export default AUV;
