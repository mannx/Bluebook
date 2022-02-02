import React from "react";
import NumberFormat from "react-number-format";

class Top5Data extends React.Component {
		constructor(props){
				super(props);

				this.state = {
				}
		}

		NF = (obj, prefix="", suffix="") => {
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

		render() {
				return (
						<table><caption>{this.props.data.Title}</caption>
								<thead><tr>
										<th>Date</th>
										<th>$</th>
								</tr></thead>
								<tbody>
										{this.props.data.Data.map(function(obj, i) {
												const f = this.props.data.Field;
												const val = obj[f];

												return (<tr>
														<td>{obj.DateString}</td>
														<td>{this.NF(val, "$")}</td>
												</tr>);
										}, this)}
								</tbody>
						</table>
				);
		}
}

export default Top5Data;
