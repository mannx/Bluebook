import React from "react";

class Daily extends React.Component {
		constructor(props) {
				super(props);

				this.state = {
						data: null,		// data containing availble files to import
						imports: null,	// list of all the files that will be imported
				}

				this.getControls = this.getControls.bind(this);
				this.addImp = this.addImp.bind(this);
				this.performUpdate = this.performUpdate.bind(this);
		}

		async componentDidMount() {
				// load in the available import data from the server
				const url = "http://localhost:8080/api/import/daily";
				const resp = await fetch(url);
				const data = await resp.json();
				
				// display and choose which files to import
				this.setState({data: data});
		}

		getControls() {
				console.log(this.state.data);
				//return <span>getControls</span>;

				this.state.data.map(function(obj, i) {
						return <span>{obj}</span>;
				});
		}

		addImp(e) {
				if(this.state.imports == null ) {
						//this.state.imports = [e.target.name];
						this.setState({imports: [e.target.name]});
				}else{
						//this.state.imports=[...this.state.imports, e.target.name];
						this.setState({imports: [...this.state.imports, e.target.name]});
				}
				console.log("add import " + this.state.imports);
		}

		render() {
				if(this.state.data == null) {
						return <h1>Loading Data...</h1>;
				}

				return (
						<div><h3>Daily Sheets Available for Import</h3>
								<button onClick={this.performUpdate}>Update</button>
								{this.state.data.map(function(obj, i) {
										return (<>
												<input type={"checkbox"} onChange={this.addImp} name={obj}/>
												<span>{obj}</span>
										</>);},this)}
							</div>
				);
						
		}

		// send the list of id's to be updated to the server
		// TODO: find a way to get progress, another api waypoint with a timer?
		performUpdate() {
				const url = "http://localhost:8080/api/import/daily";
				
				const options = {
						method: 'POST',
						headers: {'Content-Type':'application/json'},
						body: JSON.stringify(this.state.imports)
				};

				fetch(url, options)
					.then(res => res.json())
					.then(data => console.log("update: " + data));
		}
}

export default Daily;
