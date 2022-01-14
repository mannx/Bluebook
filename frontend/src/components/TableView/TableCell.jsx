import React from "react";
import NumberFormat from "react-number-format";

//
//	This is used to draw a single row and fill in its data
//	
class TableCell extends React.Component {

		O(obj) {
				return (
						<NumberFormat 
						value={obj} 
						displayType={"text"} 
						thousandSeparator={true} 
						prefix={'$'} 
						decimalScale={2}
						fixedDecimalScale={true}
						/>
				);
		}

		render() {
				return (
						<tr>
								<td>01</td>
								<td>{this.props.data.Date}</td>
								<td>{this.O(this.props.data.GrossSales)}</td>
								<td>{this.O(this.props.data.HST)}</td>
								<td>{this.O(this.props.data.BottleDeposit)}</td>
								<td>{this.O(this.props.data.NetSales)}</td>
								<td></td>

								<td>{this.O(this.props.data.DebitCard)}</td>
								<td>{this.O(this.props.data.Visa)}</td>
								<td>{this.O(this.props.data.MasterCard)}</td>
								<td>{this.O(this.props.data.Amex)}</td>
								<td>{this.O(this.props.data.CreditSales)}</td>
								<td></td>

								<td>{this.O(this.props.data.GiftCardRedeem)}</td>
								<td>{this.O(this.props.data.GiftCardSold)}</td>
								<td></td>

								<td>{this.O(this.props.data.HoursWorked)}</td>
								<td>{this.O(this.props.data.Productivity)}</td>
								<td>{this.O(this.props.data.Factor)}</td>
								<td>{this.O(this.props.data.AdjustedSales)}</td>
								<td>{this.O(this.props.data.CustomerCount)}</td>
								<td>{this.O(this.props.data.ThirdPartyPercent)}</td>
								<td>{this.O(this.props.data.ThirdPartyDollar)}</td>
								<td></td>

						</tr>
				);
		}
}

export default TableCell;
