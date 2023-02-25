import React from "react";
import TableCell from "./TableCell.jsx";
import TableEOW from "./TableEOW.jsx";
import UrlGet from "../URLs/URLs.jsx";
import "./table.css";

//
// This is used to display the entire table view
// 
export default class TableView extends React.Component {
	state = {
		data: null,
		month: 0,
		year: 0,
		loading: true,
	}

	constructor(props) {
		super(props);

		this.state.month = props.month;
		this.state.year = props.year;
	}

	loadData = async (month, year) => {
		const url = UrlGet("Month") + "?month=" + month + "&year=" + year;
		const resp = await fetch(url);
		const data = await resp.json();

		this.setState({data: data, loading: false, month: month, year:  year});
	}

	reload = () => {
		this.loadData(this.props.month, this.props.year);
		console.log("reloading data...");
	}

	render() {
		if(this.state.loading === true || this.state.data == null) {
			this.loadData(this.props.month, this.props.year);
			return <h1>Loading data...</h1>;
		}else if(this.state.month !== this.props.month || this.state.year !== this.props.year) {
			this.loadData(this.props.month, this.props.year);
			return <h1>Loading new data...</h1>;
		}

		return (
			<table className="MyStyle">
				<caption><h1>{this.state.data.MonthName} {this.state.year}</h1></caption>
				<thead>
					<tr className="MyStyle">
						<th className="MyStyle"></th>
						<th className="MyStyle">Day</th>
						<th className="MyStyle">Gross Sales</th>
						<th className="MyStyle">HST</th>
						<th className="MyStyle">Bot Dep</th>
						<th className="MyStyle">Net Sales</th>
						<th className="div"></th>

						<th className="MyStyle">Debit</th>
						<th className="MyStyle">Visa</th>
						<th className="MyStyle">MC</th>
						<th className="MyStyle">Amex</th>
						<th className="MyStyle">Credit Sales</th>
						<th className="div"></th>

						<th className="MyStyle">GC Redeem</th>
						<th className="MyStyle">GC Sold</th>
						<th className="div"></th>

						<th className="MyStyle">Hours</th>
						<th className="MyStyle">Prod</th>
						<th className="MyStyle">Factor</th>
						<th className="MyStyle">Adj Sales</th>
						<th className="MyStyle">Cust Count</th>
						<th className="MyStyle no-print">$ 3rd Party</th>
						<th className="MyStyle no-print">% 3rd Party</th>
						<th className="div"></th>

						<th className="MyStyle">Comments</th>
						<th className="MyStyle no-print">Tags</th>
					</tr>
				</thead>
				<tbody>
				{this.state.data.Data.map(function (obj, i) {
					if(obj.IsEndOfWeek) {
						return (
							<>
								<TableCell data={obj} searchTag={this.props.navTag} reload={this.reload} />
								<TableEOW data={obj} />
							</>
						);
					}
					return <TableCell data={obj} searchTag={this.props.navTag} />;
				}, this)}
			</tbody>
			</table>
		);
	}
}
