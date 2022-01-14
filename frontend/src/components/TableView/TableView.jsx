import React from "react";
import TableCell from "./TableCell.jsx";
import "./table.css";

//
// This is used to display the entire table view
// 
class TableView extends React.Component {
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

		async componentDidMount() {
			const url = "http://localhost:8080/api/month?month=" + this.state.month + "&year=" + this.state.year;
			const resp = await fetch(url);
			const data = await resp.json();

				console.log(data);
				//this.state.data = data;
				this.setState({data: data, loading: false});
		}

		render() {
			if(this.state.loading == true || this.state.data == null) {
					return <h1>Loading data...</h1>;
			}

			return (
					<table>
							<caption><h1>Month {this.state.month} {this.state.year}</h1></caption>
							<thead>
								<tr>
									<th></th>
									<th>Day</th>
									<th>Gross Sales</th>
									<th>HST</th>
									<th>Bot Dep</th>
									<th>Net Sales</th>
									<th></th>

										<th>Debit</th>
										<th>Visa</th>
										<th>MC</th>
										<th>Amex</th>
										<th>Credit Sales</th>
										<th></th>

										<th>GC Redeem</th>
										<th>GC Sold</th>
										<th></th>

										<th>Hours</th>
										<th>Prod</th>
										<th>Factor</th>
										<th>Adj Sales</th>
										<th>Cust Count</th>
										<th>% 3rd Party</th>
										<th>$ 3rd Party</th>
										<th></th>

										<th>Comments</th>
										<th>Tags</th>
								</tr>
							</thead>
							<tbody>
							{this.state.data.Data.map(function (obj, i) {
									return <TableCell data={obj} />;
							})}
					</tbody>
					</table>
			);
		}
}

export default TableView;
