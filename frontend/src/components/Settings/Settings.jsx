import React from "react";
import UrlGet from "../URLs/URLs.jsx";
import DeleteDialog from "./DeleteDialog.jsx";
import CombinedDialog from "./CombinedDialog.jsx"
import AddDialog from "./AddDialog.jsx"

import "../TableView/table.css";
/*
 * This page is currently only used to adjust wastage settings
 * */
export default class Settings extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			data: null,
			counts: null,
			isLoading: true,
			units: [],
			locations: [],

			combined: [],			// which items are marked for combining
			combineCheck: [],

			combinedDialog: false,	// display the combined confirmation dialog?
			deleteDialog: false,
			addDialog: false,
		}
	}

	loadData = async () => {
		const url = UrlGet("WasteSettings");
		const resp = await fetch(url);
		const data = await resp.json();

		this.setState({
			isLoading:false,
			data: data.Data, 
			counts: data.Counts,
			units: data.Units,
			locations: data.Locations,

			// initialize all checkboxes as cleared, ID to map to array
			combineCheck: Array(data.Data.length).fill(false),
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
			<CombinedDialog
				visible={this.state.combinedDialog}
				Items={this.state.combined}
				onClose={this.combineDlgToggle}
				onConfirm={this.confirmCombine}
			/>
			<AddDialog
				visible={this.state.addDialog}
				onClose={this.addDlgToggle}
				onConfirm={this.confirmAddDialog}
				units={this.state.units}
				locations={this.state.locations}
			/>
		</>);
	}


	deleteClose = () => {this.setState({deleteDialog: false});}
	confirmDelete = () => {
		this.setState({deleteDialog: false});

		var items = Array(this.state.combined.length);
		for(var i = 0; i < this.state.combined.length; i++) {
			items[i] = this.state.combined[i].Id;
		}

		// POST it to the server
		const options = {
			method: 'POST',
			headers: {'Content-Type':'application/json'},
			body: JSON.stringify(items)
		};

		const url = UrlGet("DeleteWasteItem");

		fetch(url, options)
			.then(r => r.text())
			.then(r => this.setState({msg: r}));

		this.clearSelection();
		
		// attempt to force a reload on all the items
		// TODO: doesn't work as expected, only works aftera refresh
		this.loadData();
		this.forceUpdate();
	}

	combineDlgToggle = () => {this.setState({combinedDialog: !this.state.combinedDialog});}
	confirmCombine = () => {
		this.combineDlgToggle();

		var items = Array(this.state.combined.length);
		for(var i = 0; i < this.state.combined.length; i++) {
			items[i] = this.state.combined[i].Id;
		}

		// POST it to the server
		const options = {
			method: 'POST',
			headers: {'Content-Type':'application/json'},
			body: JSON.stringify(items)
		};

		const url = UrlGet("CombineWasteItems");

		fetch(url, options)
			.then(r => r.text())
			.then(r => this.setState({msg: r}));

		this.clearSelection();
		
		// attempt to force a reload on all the items
		// TODO: doesn't work as expected, only works aftera refresh
		this.loadData();
		this.forceUpdate();
	}

	addDlgToggle = () => {this.setState({addDialog: !this.state.addDialog});}

	confirmAddDialog = (data) => {
		this.addDlgToggle();
		
		// POST it to the server
		const options = {
			method: 'POST',
			headers: {'Content-Type':'application/json'},
			body: JSON.stringify(data)
		};

		const url = UrlGet("AddNewWasteItem");

		fetch(url, options)
			.then(r => r.text())
			.then(r => this.setState({msg: r}));

		// attempt to force a reload on all the items
		// TODO: doesn't work as expected, only works aftera refresh
		this.loadData();
		this.forceUpdate();
	}

	// render wastage table for display and editing
	renderWastage = () => {
		// TODO:
		//	Adjust error/sucess message
		return (
			<>
			<div>
				<button onClick={this.addDlgToggle}>Add</button>
				<button onClick={this.updateWastage}>Update</button>
				<button onClick={this.combineDlgToggle}>Combine</button>
				<button onClick={this.deleteWasteItem}>Delete</button>
				<button onClick={this.clearSelection}>Clear Selection</button>

				<div>{this.state.msg}</div>
				<table><caption><h3>Wastage Entries</h3></caption>
					<thead><tr>
						<th></th>
						<th>Count</th>
						<th>Name</th>
						<th>Unit</th>
						<th>Location</th>
					</tr></thead>
					<tbody>
						{this.state.data.map(function (obj, i) {
							return (<tr>
								<td><input type="checkbox" id={obj.ID} name={obj.Name} onChange={() => {this.onCombinedChecked(obj.ID, i)}} checked={this.state.combineCheck[i]}/></td>
								<td>{this.state.counts[i]}</td>
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
			return null;	// removes a warning about no return value
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

	onCombinedChecked = (id, idx) => {
		var item = {
			Id: id,
			Name: this.state.data.find(n => n.ID === id).Name,
		};

		var n = this.state.combineCheck;
		n[idx] = !n[idx];

		this.setState({
			combined: [...this.state.combined, item],
			combineCheck: n
		});
	}

	// Called when 'Combine' button is pressed to combine selected items
	// first display popup to confirm and pick the item we want to use for all
	combineWastageItems = () => {
		this.setState({combinedDialog: true});
	}

	deleteWasteItem = () => {
		this.setState({deleteDialog: true});
	}

	clearSelection = () => {
		var arr = this.state.combineCheck;
		for(var i = 0; i < arr.length; i++) {
			arr[i] = false;
		}

		this.setState({
			combineCheck: arr,
			combined: [],
		});
	}
}
