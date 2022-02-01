import React from "react";
import UrlGet from "../URLs/URLs.jsx";


class Top5 extends React.Component {

		constructor(props) {
				super(props);

				this.state = {
						month: null,
						year: null,
						data: null,
						loading: true,
				}
		}

		loadData = async () => {
				const urlBase = UrlGet("Top5");
				const month = this.state.month === null ? null : ("month="+this.state.month);
				const year = this.state.year === null ? null : ("year="+this.state.year);

				var url = "";
				var b=false;
				if(month !== null ){
						url = "?"+month;
						b=true;
				}

				if(year !== null) {
						url = (b ? "&" : "?") + year;
				}

				console.log("loaddata:");
				console.log(urlBase+url);
		}

		componentDidMount() {
				this.loadData();
		}

		render() {
				return this.header();
		}

		header = () => {
				return (<>
						<div>
								Year: <select><option value="Any">Any</option></select>
								<button>View</button>
						</div>
				</>);
		}
}

export default Top5;
