import React from "react";
import NumberFormat from "react-number-format";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

class Wastage extends React.Component {
		constructor(props) {
				super(props);
				this.state = {
						date: null,
						data: null,
						errorMsg: "",
				}
		}

		loadData = async () => {
				if(this.state.date == null ) return;

				const month = this.state.date.getMonth()+1;
				const year = this.state.date.getFullYear();
				const day = this.state.date.getDate();

				const url = "http://localhost:8080/api/waste/view?month="+month+"&year="+year+"&day="+day;
				const resp = await fetch(url);
				const data = await resp.json();

				this.setState({data: data});
				console.log(data);
		}

		header = () => {
				return (
						<div><span>Pick Week To View:</span>
								<DatePicker selected={this.state.date} onChange={(d)=>this.setState({date:d})} />
								<button onClick={this.loadData}>View</button>
						</div>);
		}

		render() {
				if(this.state.data == null){
						return (<>{this.header()}<h1>Loading</h1></>);
				}

				const month = this.state.date.getMonth()+1;
				const year = this.state.date.getFullYear();
				const day = this.state.date.getDate();

				return (<>
						{this.errorMessage()}
						{this.header()}
						<table>
								<caption>Waste for {month}/{day}/{year}</caption>
								<thead>
										<tr>
											<th>Item</th>
											<th>Weight</th>
										</tr>
								</thead>
								<tbody>
								{this.state.data.Data.map(function (obj, i) {
										if(obj.Name !== ""){
											return (<tr>
													<td>{obj.Name}</td>
													<td>{this.NF(obj.Amount)}</td>
													</tr>
											);
										}else{
											return (<tr><td>&nbsp;</td><td>&nbsp;</td></tr>);
										}
								}, this)}
								</tbody>
						</table>
						</>);
		}

		errorMessage = () => {
				if(this.state.errorMsg !== ""){ 
					return <span className="error">{this.state.errorMsg}</span>;
				}else{
						return <></>;
				}
		}

		NF = (obj) => {
				return (
						<NumberFormat
						value={obj}
						displayType={"text"}
						thousandSeparator={true}
						decimalScale={2}
						fixedDecimalScale={true}
						/ >
				);
		}

}


export default Wastage;
