import React from "react";
import "./import.css";

//
// This class is used to manage all imports
// it requires a URL property for the GET/POST url
//
export default class ImportControl extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			data: null,		// data containing availble files to import
			imports: null,	// list of all the files that will be imported
			page: props.page,
		}
	}

	loadData = async () => {
		// load in the available import data from the server
		const resp = await fetch(this.props.URL);
		const data = await resp.json();
		
		// display and choose which files to import
		this.setState({data: data});
	}

	async componentDidMount() {
		this.loadData();
	}

	componentDidUpdate(prev) {
		if(prev.page !== this.props.page){
			this.loadData();
		}
	}

	getControls = () => {
		this.state.data.map(function(obj, i) {
			return <span>{obj}</span>;
		});
	}

	addImp = (e) => {
		if(this.state.imports == null ) {
			this.setState({imports: [e.target.name]});
		}else{
			this.setState({imports: [...this.state.imports, e.target.name]});
		}
	}

	render() {
		if(this.state.data == null) {
			return <h1>Loading Data...</h1>;
		}

		return (
			<div><h3>{this.props.title} Available for Import (page {this.props.page})</h3>
				<button onClick={this.performUpdate}>Update</button>
				<ul className="Import">
				{this.state.data.map(function(obj, i) {
					return (<li>
							<input type={"checkbox"} onChange={this.addImp} name={obj}/>
							<span>{obj}</span>
					</li>);
				},this)}
				</ul>
			</div>
		);
					
	}

	// send the list of id's to be updated to the server
	// TODO: find a way to get progress, another api waypoint with a timer?
	performUpdate = () => {
		const options = {
			method: 'POST',
			headers: {'Content-Type':'application/json'},
			body: JSON.stringify(this.state.imports)
		};

		fetch(this.props.URL, options)
			.then(r => r.text())
			.then(r => this.updateResult(r));
	}

	updateResult = (msg) => {
		if(msg !== null) {
			this.props.result(msg);
		}
	}

}
