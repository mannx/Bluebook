import React from "react";
import TableView from "../../components/TableView/TableView.jsx";
import "./header.css";

//
// This is used to provide navigation between the data we are viewing
// and any other pages
//

function NavButton(props) {
		return (
				<span className={"navLink"} onClick={props.func}> {props.name}</span>
		);
}
function func(props){}


function Navigate(props) {
		return <TableView month={props.month} year={props.year} />;
}

class Navigation extends React.Component {
		constructor(props) {
				super(props);

				this.state = {
						// make sure month and year are both considered integers
						month: parseInt(props.month), 
						year: parseInt(props.year)
				};

				this.NavigatePrev = this.NavigatePrev.bind(this);
				this.NavigateNext = this.NavigateNext.bind(this);
		}

		render() {
				return (
						<>
						<div><ul className={"navControl"}>
							<li className={"navControl"}><NavButton name={"Prev"} func={this.NavigatePrev} /></li>
							<li className={"navControl"}><NavButton name={"Next"} func={this.NavigateNext} /></li>
							<li className={"navControl"}><NavButton name={"Prev Year"} func={func} /></li>
							<li className={"navControl"}><NavButton name={"Today"} func={this.funcToday} /></li>
							<li className={"navControl"}><NavButton name={"Search Tags"} func={func} /></li>
							<li className={"navControl"}><NavButton name={"AUV"} func={func} /></li>
							<li className={"navControl"}><NavButton name={"Weekly Info"} func={func} /></li>
							<li className={"navControl"}><NavButton name={"Wastage"} func={func} /></li>
							<li className={"navControl"}><NavButton name={"Top 5"} func={func} /></li>
							<li className={"navControl"}><NavButton name={"Settings"} func={func} /></li>
						</ul></div>
						<Navigate month={this.state.month} year={this.state.year} page={this.state.page} />
						</>
				);
		}

		funcToday() {
				alert("today!");
		}

		NavigatePrev() {
			var m = this.state.month;
			var y = this.state.year;

			if(m === 1) {
					y = y - 1;
					m = 12;
			}else{
					m = m - 1;
			}

			//this.state = {month: m, year: y};
			this.setState({month: m, year: y});
		}

		NavigateNext() {
				var m = this.state.month;
				var y = this.state.year;

				if(m === 12){
						y = y + 1;
						m = 1;
				}else{
						m = m + 1;
				}


				this.setState({month: m, year: y});
		}
}


export default Navigation
