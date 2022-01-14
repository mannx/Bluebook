import React from "react";
import TableView from "../../components/TableView/TableView.jsx";
import Header from "../../components/Header/Header.jsx";

//
// This is used to provide navigation between the data we are viewing
// and any other pages
//

function Navigate(props) {
	switch(props.state.currentPage) {
		case 1:
			return <TableView month={props.state.currentMonth} year={props.state.currentYear} />;
		case 0:
		default:
			return <h1>Page here #{props.state.currentPage}</h1>;
	}
}

class Navigation extends React.Component {

	state = {
			currentPage: 1,		// the current page we are on

			currentMonth: 12,	// the current month we are displaying
			currentYear: 2021,	// the current year we are displaying

			PageMonthly: 1		// default view, shows monthly data
	}

		constructor(props) {
				super(props)
		}

		render() {
				return (
						<>
						<Header />
						<Navigate state={this.state} />
						</>
				);
		}

}

export default Navigation
