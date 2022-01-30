import React from "react";
import NumberFormat from "react-number-format";
import "./eow.css";

function num(obj) {
		return (
				<NumberFormat
						value={obj}
						displayType={"text"}
						thousandSeparator={true}
						decimalScale={2}
						fixedDecimalScale={true}
				/>
		);
}

function TableEOW(props) {
		return (
				<tr className="blank">
						<td className="blank"></td>
						<td className="blank"></td>
						<td className="blank"></td>
						<td className="blank"></td>
						<td className="blank"></td>
						<td className="Net">{num(props.data.EOW.NetSales)}</td>

						<td className="blank"></td>
						<td className="blank"></td>
						<td className="blank"></td>
						<td className="blank"></td>
						<td className="blank"></td>
						<td className="blank"></td>
						<td className="blank"></td>
						<td className="blank"></td>
						<td className="blank"></td>
						<td className="blank"></td>
						<td className="blank"></td>
						<td className="blank"></td>
						<td className="blank"></td>
						<td className="blank"></td>
						<td className="CustomerCount">{num(props.data.EOW.CustomerCount)}</td>
						<td className="ThirdPartyPerc no-print">{num(props.data.EOW.ThirdPartyPercent)}</td>
						<td className="no-print">{num(props.data.EOW.ThirdPartyTotal)}</td>
				</tr>
		);
		//return <tr><td>eow</td></tr>;
}

export default TableEOW;
