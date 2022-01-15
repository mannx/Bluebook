import React, {Component} from "react";
import './App.css';

import Navigation from "./components/Navigation/Navigation.jsx";

class App extends Component {

	render(){
		return (
			<div className="App">
				<Navigation month="12" year="2021"  />
			</div>
		);
	}
}

export default App;
