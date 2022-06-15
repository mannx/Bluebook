import React from "react";
import UrlGet from "../URLs/URLs.jsx";
import DeleteDialog from "./DeleteDialog.jsx";

import "./dialog.css";

/*
 * This page is currently only used to adjust wastage settings
 * */
export default class Settings extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			data: null,
			isLoading: true,
			units: [],
			locations: [],
			combined: [],			// which items are marked for combining
			combinedDialog: false,	// display the combined confirmation dialog?
			deleteDialog: false,
		}
	}

	loadData = async () => {
		const url = UrlGet("WasteSettings");
		const resp = await fetch(url);
		const data = await resp.json();

		this.setState({
			isLoading:false,
			data: data.Data, 
			units: data.Units,
			locations: data.Locations,
		});
	}

	// render the settings data for all current settings
	render = () => {
		if (this.state.isLoading === true) {
			this.loadData();
			return <h3>Loading...</h3>;
		}

		return (<>
			{this.renderWastage()}
			<DeleteDialog 
				visible={this.state.deleteDialog}
				Items={this.state.combined}
				onClose={this.deleteClose}
				onConfirm={this.confirmDelete}
			/>
		</>);
	}

	deleteClose = () => {this.setState({deleteDialog: false});}
	confirmDelete = () => {
		this.setState({deleteDialog: false});

		console.log("Deleting the following items:");
		this.state.combined.map(function(obj) {
			console.log(" > " + obj.Name);
			return 0;
		});
	}

	// Clear out the selected items after processing a dialog box
	clearSelection = () => {
		combined = [];
	}

	/*
	<div>
		<h3>Items to combine</h3>
		<ul>
		{this.state.combined.map(function(obj) {
			var name = this.state.data.find(n => n.ID === obj);
			return <li>{name.Name}</li>;
		}, this)}
		</ul>
	</div>
	 * */
	// render wastage table for display and editing
	renderWastage = () => {
		return (
			<>
			<div>
				<button onClick={this.updateWastage}>Update</button>
				<button onClick={this.combineWastageItems}>Combine</button>
				<button onClick={this.deleteWasteItem}>Delete</button>

				<table><caption><h3>Wastage Entries</h3></caption>
					<thead><tr>
						<th></th>
						<th>Name</th>
						<th>Unit</th>
						<th>Location</th>
					</tr></thead>
					<tbody>
						{this.state.data.map(function (obj, i) {
							return (<tr>
								<td><input type="checkbox" id={obj.ID} name={obj.Name} onClick={() => {this.onCombinedChecked(obj.ID)}}/></td>
								<td>{obj.Name}</td>
								<td>{this.renderUnitOptions(obj)}</td>
								<td>{this.renderLocationOptions(obj)}</td>
							</tr>);
						}, this)}
					</tbody>
				</table>
			</div>
			</>
		);
	}

	renderUnitOptions = (obj) => {
		return (<select value={obj.UnitMeasure} onChange={(v)=>{this.updateUnitMeasure(v.target.value, obj)}}>
			{this.state.units.map(function(obj, i) {
				return <option value={i}>{obj}</option>;
			})}
		</select>);
	}

	renderLocationOptions = (obj) => {
		return (<select value={obj.Location} onChange={(v)=>{this.updateLocation(v.target.value, obj)}}>
			{this.state.locations.map(function(obj,i) {
				return <option value={i}>{obj}</option>;
			})}
		</select>);
	}

	updateUnitMeasure = (val, obj) => {
		obj.UnitMeasure = parseInt(val);
		obj.Changed = true;
		this.forceUpdate();
	}

	updateLocation = (val, obj) => {
		obj.Location = parseInt(val);
		obj.Changed = true;
		this.forceUpdate();
	}

	// send the updated items back to the server to update
	updateWastage = () => {
		// retrieve the items that have updated only
		var updates = [];

		this.state.data.map(function(obj) {
			if(obj.Changed===true){
				console.log(obj.Name + ": " + obj.UnitMeasure);
				updates.push(obj);
			}
		});

		const options = {
			method: 'POST',
			headers: {'Content-Type':'application/json'},
			body: JSON.stringify(updates)
		};

		const url = UrlGet("WasteUpdate");

		fetch(url, options)
			.then(r => r.text())
			.then(r => this.setState({msg: r}));
	}

	customConversionInput = (obj) => {
		return <>?</>;
	}

	conversionDataInput = (obj) => {
		return <>ConversionData</>;
	}

	onCombinedChecked = (id) => {
		//this.setState({combined: [...this.state.combined, id]});
		var item = {
			Id: id,
			Name: this.state.data.find(n => n.ID === id).Name,
		};

		this.setState({combined: [...this.state.combined, item]});
	}

	// Called when 'Combine' button is pressed to combine selected items
	// first display popup to confirm and pick the item we want to use for all
	combineWastageItems = () => {
		this.setState({combinedDialog: true});
	}

	deleteWasteItem = () => {
		this.setState({deleteDialog: true});
	}
}
