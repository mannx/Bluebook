import React from "react";
import UrlGet from "../URLs/URLs.jsx";

export default class WasteInput extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			items: [{Item: "item here", Quantity: 123}],

			names: [],
		}
	}

	loadData = async () => {
		const url = UrlGet("WasteNames");
		const resp = await fetch(url);
		const data = await resp.json();

		this.setState({names: data});
	}

	componentDidMount = () => {
		this.loadData();
	}

	render = () => {
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
							<td>
								<input list="types" name={obj.Name} />
								<datalist id="types">
									{this.state.names.map(function(obj){
										return <option value={obj}/>;
									})}
								</datalist>
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
