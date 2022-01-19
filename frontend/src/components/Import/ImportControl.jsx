import React from "react";
import "./import.css";

//
// This class is used to manage all imports
// it requires a URL property for the GET/POST url
//
class ImportControl extends React.Component {
		constructor(props) {
				super(props);

				this.state = {
						data: null,		// data containing availble files to import
						imports: null,	// list of all the files that will be imported
						url: props.URL,	// url to use
						page: props.page,
				}

				this.getControls = this.getControls.bind(this);
				this.addImp = this.addImp.bind(this);
				this.performUpdate = this.performUpdate.bind(this);
		}

		async componentDidMount() {
				// load in the available import data from the server
				const resp = await fetch(this.state.url);
				const data = await resp.json();
				
				// display and choose which files to import
				this.setState({data: data});
		}

		getControls() {
				this.state.data.map(function(obj, i) {
						return <span>{obj}</span>;
				});
		}

		addImp(e) {
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
						<div><h3>Daily Sheets Available for Import (page {this.state.page})</h3>
								<button onClick={this.performUpdate}>Update</button>
								<ul>
								{this.state.data.map(function(obj, i) {
										return (<li>
												<input type={"checkbox"} onChange={this.addImp} name={obj}/>
												<span>{obj}</span>
														</li>);},this)}
								</ul>
							</div>
				);
						
		}

		// send the list of id's to be updated to the server
		// TODO: find a way to get progress, another api waypoint with a timer?
		performUpdate() {
				const options = {
						method: 'POST',
						headers: {'Content-Type':'application/json'},
						body: JSON.stringify(this.state.imports)
				};

				console.log("body: " + options.body);
				fetch(this.state.url, options)
					.then(res => res.json())
					.then(data => console.log("update: " + data));
		}
}

export default ImportControl;
