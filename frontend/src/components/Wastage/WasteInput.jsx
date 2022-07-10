import React from "react";
import UrlGet from "../URLs/URLs.jsx";

export default class WasteInput extends React.Component {
	/*
	 * 
	 *	{
	 *		ID: int		// determined by server
	 *		Item: string	// user input
	 *		Quantity: float	// user input
	 * 		Update: bool	// has this entry been changed client side?
	 *
	 * */
	constructor(props) {
		super(props);

		this.state = {
			//items: [{Item: "item here", Quantity: 123}],
			items: [{Item: "",Quantity: 0}],
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
						{this.state.items.map(function(obj, i) {
							return this.entryFields(obj, i);
						}, this)}
					</tbody>
				</table>
			</div>
		);
	}

	entryFields = (obj, idx) => {
		const size = this.state.items.length - 1;

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
			<td>{idx === size ? this.addBtn() : this.updateBtn(idx)}</td>
		</tr>);
	}

	addBtn = () => { return <button onClick={this.NewItem}>Add</button>; }
	updateBtn = (idx) => {return <button onClick={()=>this.UpdateItem(idx)}>Update</button>; }


	NewItem = () => {
		this.setState({items: [...this.state.items, {Item: "",Quantity:0}]});
	}
}
