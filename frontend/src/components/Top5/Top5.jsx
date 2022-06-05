import React from "react";
import UrlGet from "../URLs/URLs.jsx";
import Top5Data from "./Top5Data.jsx";
import NumberFormat from "react-number-format";

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default class Top5 extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			month: null,
			year: null,
			number: 5,		// default to how many top results we want
			data: null,
			loading: true,
		}
	}

	loadData = async () => {
		const urlBase = UrlGet("Top5");
		const month = this.state.month === null ? null : ("month="+this.state.month);
		const year = this.state.year === null ? null : ("year="+this.state.year);

		var url = "";
		if(month !== null ){
			url = "&"+month;
		}

		if(year !== null) {
			url = url + "&" + year;
		}

		const url2 = urlBase + "?limit=" + this.state.number + url ;
		const resp = await fetch(url2);
		const data = await resp.json();

		this.setState({data: data, loading: false});
	}

	componentDidMount() {
		this.loadData();
	}

	render() {
		if(this.state.data === null || this.state.loading === true ) {
			return this.header();
		}

		if(this.state.data.Data === null) {
			return (<>
				{this.header()}
				<p className="error">Unable to load data, check input parameters</p>
			</>);
		}

		return (<>
			{this.header()}
			{this.state.data.Data.map(function(obj, i) {
				return <div><Top5Data data={obj} /></div>;
			})}
		</>);
	}

	header = () => {
		return (<>
			<div>
				Year: <select onChange={this.yearChange}>{this.getYearValues()}</select><br/>
				Month: <select onChange={this.monthChange}>
						<option value="Any">Any</option>
						{monthNames.map(function(obj, i) {
							return <option value={i+1}>{obj}</option>;
						})}
				</select>
				Top: 
				<NumberFormat displayType={"input"} defaultValue={5} allowNegative={false} decimalScale={0} onChange={this.numberChange}/>
				<button onClick={this.viewClick}>View</button>
			</div>
		</>);
	}

	showError = () => {
		return (
			<div>
				<p class="error">{this.state.data.Message}</p>
			</div>
		);
	}

	getYearValues = () => {
		if(this.state.data === null) {
			return <></>;
		}

		return (<>
			<option value="0">Any</option>
			{this.state.data.Years.map(function(obj, i) {
				return <option value={obj}>{obj}</option>;
			})}
		</>);
	}

	monthChange = (e) => { this.setState({month: e.target.value}); }
	yearChange = (e) => { this.setState({year: e.target.value}); }
	numberChange = (e) => {this.setState({number: e.target.value}); }
	viewClick = () => { this.loadData(); }
}
