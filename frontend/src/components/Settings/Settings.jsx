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
				<table><caption><h3>Wastage Entries</h3></caption>
					<thead><tr>
						<th>Name</th>
						<th>Unit</th>
						<th>Convert?</th>
						<th>Conversion</th>
						<th>Location</th>
					</tr></thead>
					<tbody>
						{this.state.data.map(function (obj, i) {
							return (<tr>
								<td>{obj.Name}</td>
								<td>{obj.UnitString}</td>
								<td>?</td>
								<td>Conversion</td>
								<td>{obj.LocationString}</td>
							</tr>);
						})}
					</tbody>
				</table>
			</div>
			</>
		);
	}

	renderUnitOptions = () => {
		return (<select>
			{this.state.units.map(function(obj, i) {
				return <option value={i}>{obj}</option>;
			})}
		</select>);
	}
}
