import React from "react";
import NumberFormat from "react-number-format";

class Wastage extends React.Component {
		constructor(props) {
				super(props);
				//let d = new Date();

				/*var m = d.getMonth();
				var da= d.getDay();
				var y = d.getFullYear();*/
				this.state = {
						month: 1,
						day: 11,
						year: 2022,
						data: null,
						errorMsg: "",
				}
		}

		async componentDidMount() {
				const url = "http://localhost:8080/api/waste/view?month="+this.state.month+"&year="+this.state.year+"&day="+this.state.day;
				const resp = await fetch(url);
				const data = await resp.json();

				//this.setState({data: JSON.parse(data)});
				this.setState({data: data});
				console.log(data);
		}


		render() {
				if(this.state.data == null){
						return <h1>Loading...</h1>;
				}

				return (<>
						{this.errorMessage()}
						<table>
								<caption>Waste for {this.state.month}/{this.state.day}/{this.state.year}</caption>
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
