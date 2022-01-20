import React, {Component} from "react";
import './App.css';

import Navigation from "./components/Navigation/Navigation.jsx";

class App extends Component {

	render(){
		let d = new Date();

		return (
			<div className="App">
				<Navigation month={d.getMonth()+1} year={d.getFullYear()}  />
			</div>
		);
	}
}

export default App;
