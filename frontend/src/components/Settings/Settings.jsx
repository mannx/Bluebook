import React from "react";
import UrlGet from "../URLs/URLs.jsx";

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

		return this.renderWastage();
	}

	// render wastage table for display and editing
	renderWastage = () => {
		return (
			<>
			<div>
				<button onClick={this.updateWastage}>Update</button>

				<table><caption><h3>Wastage Entries</h3></caption>
					<thead><tr>
						<th>Name</th>
						<th>Unit</th>
						<th>Location</th>
					</tr></thead>
					<tbody>
						{this.state.data.map(function (obj, i) {
							return (<tr>
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
}
