import React from "react";

export default class WasteInput extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			items: [{Item: "item here", Quantity: 123}],

			names: [
				'cookies',
				'bread',
			],
		}
	}

	render = () => {
		// see 
		// 	https://www.w3schools.com/howto/howto_js_autocomplete.asp
		// for examples of autocomplete
		//
		// Ideally want to offer a text box to allow manual entry but provide suggestions
		// for waste items that have already been set up
		//
		// Link tab/enter to move between fields and create new entries
		return (
			<div>
				<h3>Waste Input</h3>
				<table>
					<thead>
					<tr>
						<th>Item</th>
						<th>Quantity</th>
						<th></th>
					</tr>
					</thead>
					<tbody>
					{this.state.items.map(function(obj) {
						return (<tr>
							<td><input type="text"/>
							</td>
							<td><input type="text" defaultValue={obj.Quantity}/></td>
							<td><button onClick={this.NewItem}>Add</button></td>
						</tr>);
					}, this)}
					</tbody>
				</table>
			</div>
		);
	}

	NewItem = () => {
		this.setState({items: [...this.state.items, {Item: "",Quantity:0}]});
	}
}
