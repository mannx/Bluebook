import React, {Component} from "react";
import './App.css';

import TableView from "./components/TableView/TableView.jsx";

class App extends Component {

	state = {
			loading: true,
			data: null,
	}

	async componentDidMount() {
			const url ="http://localhost:8080/api/month?month=12&&year=2021";
			const resp = await fetch(url);
			const data = await resp.json();

			console.log(data);
			this.setState({loading: false, data: data});
	}

	render(){
		return (
		    <div className="App">
				<TableView data={this.state.data} />
		    </div>
		  );
	}
}

export default App;
