import React from "react";
import TableCell from "./TableCell.jsx";

//
// This is used to display the entire table view
// 
class TableView extends React.Component {
	
		state = {
				month: null,			// the current month we are viewing
				year: null,
		}


		render() {
				// display each cell as a row
				if(this.state.loading == true || this.props.data == null) {
					console.log("loading...");
						if(this.props.data == null) {
								console.log("bad data...");
						}
						return <h2>Loading...</h2>;
				}

				return (
				<table><caption><h1>Month</h1></caption>
						<tr>
								<th>Date</th>
								<th>Cash Depsoit</th>
						</tr>
						{this.props.data.map(function(d, i) {
								return <TableCell data={d} />;
						})}
				</table>
				);
		}
}

export default TableView;
