import React from "react";

class Wastage extends React.Component {
		constructor(props) {
				super(props);
				let d = new Date();

				let m = d.getMonth();
				let da= d.getDay();
				let y = d.getFullYear();
				this.state = {
						month: d.m,
						day: d.da,
						year: d.y,
						errorMsg: "",

				}

				console.log("state: " + this.state.year);
				console.log(this.state);
		}

		async componentDidMount() {
				const url = "http://localhost:8080/api/waste/view?month="+this.state.month+"&year="+this.state.year+"&day="+this.state.day;
				const resp = await fetch(url);
				const data = await resp.json();

				console.log(data);
		}


		render() {
				return (<>
						{this.errorMessage()}
						<div>Waste table here: {this.state.month}/{this.state.year}</div>
						</>);
		}

		errorMessage = () => {
				if(this.state.errorMsg !== ""){ 
					return <span className="error">{this.state.errorMsg}</span>;
				}else{
						return <></>;
				}
		}
}


export default Wastage;
