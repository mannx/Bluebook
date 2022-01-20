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
		}

		render() {
				return (<>
						{this.errorMessage()}
						<div>Waste table here</div>
						</>);
		}

		errorMessage = () => {
				if(this.state.errorMsg != ""){ 
					return <span className="error">{this.state.errorMsg}</span>;
				}else{
						return <></>;
				}
		}
}


export default Wastage;
