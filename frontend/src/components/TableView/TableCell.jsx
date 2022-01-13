import React from "react";

//
//	This is used to draw a single row and fill in its data
//	
class TableCell extends React.Component {

		render() {
				return (
						<tr>
								<td>{this.props.data.Date}</td>
								<td>{this.props.data.CashDeposit}</td>
						</tr>
				);
		}
}

export default TableCell;
