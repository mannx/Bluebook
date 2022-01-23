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

class AuvHandler extends React.Component {

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

					//date: new Date(this.props.year, this.props.month, 1, 0, 0, 0, 0,),
					date: this.props.date
			}

	}

	//async componentDidMount() {
	loadData = async () => {
			const month = this.props.date.getMonth() + 1;
			const year = this.props.date.getFullYear();

			console.log("loading data for " + month + "/" + year);
			const url ="http://localhost:8080/api/auv/view?month="+month+"&year="+year;
			const resp = await fetch(url);
			const data = await resp.json();

			this.setState({loading: false});

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

			this.setState({date: this.props.date});
	}

	async componentDidMount() {
			await this.loadData();
	}

	render() {
			if(this.state.loading) {
					this.loadData();

					return <h1>AUV data loading...</h1>;
			}

			/*if(this.state.date != this.props.date) {
					console.log("mismatched dates, reload?");
					console.log(this.props.date);

					this.loadData();
					return <h1>AUV  new data loading...</h1>;
			}*/

			const m=this.state.date.getMonth();
			const y =this.state.date.getFullYear();
			const m2=this.props.date.getMonth();
			const y2=this.props.date.getFullYear();

			if(m!=m2||y!=y2){
					this.loadData();
			}

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
									<tr>
									<td><DatePicker selected={this.state.week1date} onChange={(d) => this.setState({week1date: d})} /></td>
											<td><input type={"number"} defaultValue={this.state.week1auv} onChange={(d)=>this.setState({week1auv: d})} /></td>
											<td><input type={"number"} defaultValue={this.state.week1hours} onChange={(d)=>this.setState({week1hours: d})} /></td>
									<td></td>
									</tr>
									<tr>
									<td><DatePicker selected={this.state.week2date} onChange={(d) => this.setState({week2date: d})} /></td>
											<td><input type={"number"} defaultValue={this.state.week2auv} onChange={(d)=>this.setState({week2auv: d})} /></td>
											<td><input type={"number"} defaultValue={this.state.week2hours} onChange={(d)=>this.setState({week2hours: d})} /></td>
									<td></td>
									</tr>
									<tr>
									<td><DatePicker selected={this.state.week3date} onChange={(d) => this.setState({week3date: d})} /></td>
											<td><input type={"number"} defaultValue={this.state.week3auv} onChange={(d)=>this.setState({week3auv: d})} /></td>
											<td><input type={"number"} defaultValue={this.state.week3hours} onChange={(d)=>this.setState({week3hours: d})} /></td>
									<td></td>
									</tr>
									<tr>
									<td><DatePicker selected={this.state.week4date} onChange={(d) => this.setState({week4date: d})} /></td>
											<td><input type={"number"} defaultValue={this.state.week4auv} onChange={(d)=>this.setState({week4auv: d})} /></td>
											<td><input type={"number"} defaultValue={this.state.week4hours} onChange={(d)=>this.setState({week4hours: d})} /></td>
									<td></td>
									</tr>
									<tr>
									<td><DatePicker selected={this.state.week5date} onChange={(d) => this.setState({week5date: d})} /></td>
											<td><input type={"number"} defaultValue={this.state.week5auv} onChange={(d)=>this.setState({week5auv: d})} /></td>
											<td><input type={"number"} defaultValue={this.state.week5hours} onChange={(d)=>this.setState({week5hours: d})} /></td>
									<td><input type="checkbox"/></td>
									</tr>

							</tbody>
					</table>
					<button onClick={this.updateAUV}>Save</button>
					</>
			);
	}
		
	updateAUV = () => {
		console.log("w1 auv");
	}
}

export default AuvHandler;
