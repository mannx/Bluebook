import React from "react";
import DialogBox from "../Dialog/DialogBox.jsx";
import "../Dialog/dialog.css";

export default class AddDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			name: "",
			unit: null,
			location: null,
		}
	}

	render = () => {
		return (
			<DialogBox
				visible={this.props.visible}
				onClose={this.props.onClose}
				onConfirm={this.onConfirm}
				contents={this.contents}
			/>
		);
	}

	contents = () => {
		return (<>
			<p>Add New Wastage Item Below:</p>
			<div>
				Name: <input type="text" onChange={this.updateName}/><br/>
				Unit Type: {this.renderUnitOptions()}<br/>
				Location: {this.renderLocations()}<br/>
			</div>
		</>);
	}

	renderUnitOptions = () => {
		if(this.props.units === null) {
			return <span>No Unit Options Available</span>;
		}

		return (
			<select onChange={(v) => {this.updateUnit(v.target.value)}}>
				{this.props.units.map(function(obj, i) {
					return <option value={i}>{obj}</option>;
				})}
			</select>
		);
	}

	renderLocations = () => {
		if(this.props.locations === null) {
			return <span>No Locations Available</span>;
		}

		return (
			<select onChange={(v) => {this.updateLocation(v.target.value)}}>
				{this.props.locations.map(function(obj, i){
					return <option value={i}>{obj}</option>;
				})}
			</select>
		);
	}

	updateUnit = (val) => {
		this.setState({unit: parseInt(val)});
	}

	updateLocation = (val) => {
		this.setState({location: parseInt(val)});
	}

	updateName = (e) => {
		this.setState({name: e.target.value});
	}

	onConfirm = () => {
		this.props.onConfirm(this.state);

		// clear our state in case this is reused (as seems to be)
		// TODO:
		// 	reset form fields (and/or have them linked to state values)
	}
}
