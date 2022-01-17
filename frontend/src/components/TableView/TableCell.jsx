import React from "react";
import NumberFormat from "react-number-format";
import "./table.css";

//
//	This is used to draw a single row and fill in its data
//	
class TableCell extends React.Component {

		NF(obj, prefix="", suffix="") {
				return (
						<NumberFormat
						value={obj}
						displayType={"text"}
						thousandSeparator={true}
						prefix={prefix}
						suffix={suffix}
						decimalScale={2}
						fixedDecimalScale={true}
						/ >
				);
		}


		// output a general number
		O(obj) {
				return this.NF(obj);
		}

		P(obj) { return this.NF(obj, "","%"); }		// output a percent
		Dol(obj) {return this.NF(obj,"$",""); }

		// zero pad a number to 2 places
		Zero(obj) {
				var s = "00" + obj;
				return s.substr(s.length-2);
		}

		render() {
				return (
						<tr>
								<td>{this.Zero(this.props.data.DayOfMonth)}</td>
								<td>{this.props.data.DayOfWeek}</td>
								<td>{this.O(this.props.data.GrossSales)}</td>
								<td>{this.O(this.props.data.HST)}</td>
								<td>{this.O(this.props.data.BottleDeposit)}</td>
								<td>{this.O(this.props.data.NetSales)}</td>
								<td className="div"></td>

								<td>{this.O(this.props.data.DebitCard)}</td>
								<td>{this.O(this.props.data.Visa)}</td>
								<td>{this.O(this.props.data.MasterCard)}</td>
								<td>{this.O(this.props.data.Amex)}</td>
								<td>{this.O(this.props.data.CreditSales)}</td>
								<td className="div"></td>

								<td>{this.O(this.props.data.GiftCardRedeem)}</td>
								<td>{this.O(this.props.data.GiftCardSold)}</td>
								<td className="div"></td>

								<td>{this.O(this.props.data.HoursWorked)}</td>
								<td>{this.O(this.props.data.Productivity)}</td>
								<td>{this.O(this.props.data.Factor)}</td>
								<td>{this.O(this.props.data.AdjustedSales)}</td>
								<td>{this.O(this.props.data.CustomerCount)}</td>
								<td>{this.P(this.props.data.ThirdPartyPercent)}</td>
								<td>{this.Dol(this.props.data.ThirdPartyDollar)}</td>
								<td className="div"></td>

								<td>
									<div className="comment">{this.props.data.Comment}</div>
									<form onSubmit={this.submitComment} method={"post"} hidden>
										<input type={"text"} name={"comment"} value={this.props.data.Comment} />
										<input type={"hidden"} name="LinkedID" value={this.props.data.ID} />
										<input type={"submit"} value={"Update"} />
									</form>
								</td>
								<td>TAGS</td>
						</tr>
				);
		}

		submitComment() {}
}

export default TableCell;
