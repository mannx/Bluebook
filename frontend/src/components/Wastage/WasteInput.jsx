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
			items: [],
			names: [],
		}
	}

	loadData = async () => {
		const url = UrlGet("WasteNames");
		const resp = await fetch(url);
		const data = await resp.json();

		this.setState({names: data});
	}

	loadItems = async () => {
		const url = UrlGet("WasteInputGet")
		const resp=await fetch(url);
		const data=await resp.json();

		if(data.length !== 0) {
			this.setState({items: data});
		}else{
			this.NewItem();
		}
	}


	componentDidMount = () => {
		this.loadData();		// load waste names
		this.loadItems();		// load initial wastage holding
	}

	render = () => {
		// Link tab/enter to move between fields and create new entries
		return (<>
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
		</>);
	}

	// render an input field if edit ==true, else just display the contents
	itemField = (obj, idx, edit) => {
		if(edit===true){
			return (<>
				<input list="types" defaultValue={obj.Name} onChange={
					(e)=>{
						var items=this.state.items;
						items[idx].Name=e.target.value;
						this.setState({items:items});
					} }
				/>
				<datalist id="types">
					{this.state.names.map(function(obj){
						return <option value={obj}/>;
					})}
				</datalist>
			</>);
		}else{
			return <span>{obj.Name}</span>;
		}
	}

	quantityField = (obj, idx, edit) => {
		if(edit===true) {
			return (<>
				<input type="text" defaultValue={obj.Quantity} onChange={
					(e)=> {
						var items = this.state.items;
						items[idx].Quantity = e.target.value;
						this.setState({items: items});
					} }
				/>
			</>);
		}else{
			return <span>{obj.Quantity}</span>;
		}
	}

	entryFields = (obj, idx) => {
		const size = this.state.items.length - 1;
		const edit = idx === size;

		return (<tr>
			<td>{this.itemField(obj,idx,edit)}</td>
			<td>{this.quantityField(obj, idx, edit)}</td>
			<td>{idx === size ? this.addBtn(idx) : this.updateBtn(idx)}</td>
		</tr>);
	}

	addBtn = (idx) => { return <button onClick={()=>{this.AddItem(idx)}}>Add</button>; }
	updateBtn = (idx) => {return <button onClick={()=>this.UpdateItem(idx)}>Update</button>; }


	NewItem = () => {
		this.setState({items: [...this.state.items, {Name: "",Quantity:0}]});
	}

	// take the current item and send to the server to add to the holding table
	// refresh data afterwards
	// takes index to the item in the state we are adding
	AddItem = (idx) => {
		const item = this.state.items[idx];

		const options = {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(this.state.items[idx])
		}

		// post the data
		fetch(UrlGet("WasteInputAdd"), options)
			.then(r => console.log(r));

		// reload
		this.loadItems();
	}
}
