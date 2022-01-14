import React, {Component} from "react";
import './App.css';

import TableView from "./components/TableView/TableView.jsx";
import Navigation from "./components/Navigation/Navigation.jsx";

class App extends Component {

	render(){
		return (
			<div className="App">
				<Navigation />
			</div>
		);
	}
}

export default App;
