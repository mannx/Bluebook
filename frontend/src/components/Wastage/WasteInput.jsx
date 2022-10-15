import React from "react";
import {UrlGet, GetPostOptions} from "../URLs/URLs.jsx";
import DatePicker from "react-datepicker";
import DialogBox from "../Dialog/DialogBox.jsx";
import FormatUTC from "../Utils/Utils.jsx";

import "../Dialog/dialog.css";
import "react-datepicker/dist/react-datepicker.css";

class ConfirmSubmitDialog extends  React.Component {
	render = () => {
		return (
			<DialogBox
				visible={this.props.visible}
				onClose={this.props.onClose}
				onConfirm={this.props.onConfirm}
				contents={this.contents}
			/>
		);
	}

	contents = () => {
		return (<>
			<p>Confirm submittion of wastage for week ending: {this.props.date.toDateString()}?</p>
		</>);
	}
}

export default class WasteInput extends React.Component {
	constructor(props) {
		super(props);

		// get the current date, if a wednesday, auto move back to tuesday
		// for week ending date
		var d = new Date();
		if(d.getDay() === 3) {
			d.setDate(d.getDate() - 1);
		}

		// get the date for the start of the week
		var start = new Date();
		// TODO: adjust date to the previous wednesday
		
		this.state = {
			items: [],
			names: [],
			date: d,			// week ending date for this wastage

			currDate: start,		// current date we are using for all new entries

			confirmDlg: false,

			deleteCheck: false,		// display checkbox to select items to remove
			deleteItems: [],		// list of items to delete from the holding table

			message: null,
			error: false,
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

		if(data === null) {
			this.NewItem();
			return;
		}

		if(data.length !== 0) {
			this.setState({items: data});
		}

		this.NewItem();
	}

	loadItems2 = (data) => {
		if(data.Error === false) {
			// have valid item data
			const items = data.Items === null ? this.NewItem() : data.Items;
			this.setState({items: items,Error:false});
		}else{
			this.setState({Error:true,Message:data.Message});
		}
	}


	componentDidMount = () => {
		this.loadData();		// load waste names
		this.loadItems();		// load initial wastage holding
	}

	render = () => {
		// Link tab/enter to move between fields and create new entries
		return (<>
			<ConfirmSubmitDialog
				visible={this.state.confirmDlg}
				date={this.state.date}
				onClose={this.submitClose}
				onConfirm={this.submitConfirm}
			/>
			<div>
				<h3>Waste Input</h3>
				<div>
					<span>Week Ending:</span>
					<DatePicker selected={this.state.date} onChange={(d)=>this.setState({date: d})} />
					<button onClick={this.submit}>Submit</button>
				</div>
				{this.showErrors()}
				<table>
					<thead>
					<tr>
						<th>Date</th>
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

	showErrors = () => {
		if(this.state.Error === true) {
			return (<div>
				<span className="error">{this.state.Message}</span>
			</div>);
		}else{
			return (<></>);
		}
	}

	// render an input field if edit ==true, else just display the contents
	itemField = (obj, idx, edit) => {
		if(edit===true){
			return (<>
				<input autoFocus list="types" defaultValue={obj.Name} onChange={
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

	dateField = (obj, idx, edit) => {
		// const date = new Date(obj.Date);
		const date =  FormatUTC(obj.Date, true);

		return (<>
			<DatePicker selected={date} tabIndex={-1} onChange={
				(e) => {
					var items = this.state.items;
					items[idx].Date = e;
					this.setState({items: items});
				}}
			/>
		</>);
	}

	entryFields = (obj, idx) => {
		const size = this.state.items.length - 1;
		const edit = idx === size;

		return (<tr>
			<td>{this.dateField(obj, idx, edit)}</td>
			<td>{this.itemField(obj,idx,edit)}</td>
			<td>{this.quantityField(obj, idx, edit)}</td>
			<td>{idx === size ? this.addBtn(idx) : this.updateBtn(idx)}</td>
		</tr>);
	}

	addBtn = (idx) => { return <button onClick={()=>{this.AddItem(idx)}}>Add</button>; }
	updateBtn = (idx) => {return <button onClick={()=>this.DeleteItem(idx)}>Delete</button>; }


	NewItem = () => {
		this.setState({items: [...this.state.items, {Date: this.state.currDate, Name: "",Quantity:0}]});
	}

	// take the current item and send to the server to add to the holding table
	// refresh data afterwards
	// takes index to the item in the state we are adding
	AddItem = (idx) => {
		const options = GetPostOptions(JSON.stringify(this.state.items[idx]));

		// post the data
		fetch(UrlGet("WasteInputAdd"), options)
			.then(r => this.loadItems());
	}

	// Delete an item from the holding list given its index
	DeleteItem = (idx) => {
		var item = this.state.items[idx];

		console.log("Deleting item: " + item.Name);
		console.log("  ID: "+ item.ID);

		const options = {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({ID: item.ID}),
		}

		fetch(UrlGet("WasteInputDelete"), options)
			.then(r => r.json())
			.then(r => this.loadItems2(r));
	}

	// submit button pressed, display confirmation dialog
	submit = () => {
		this.setState({confirmDlg: true});
	}

	// submit has been closed (cancel submit, keep data)
	submitClose = () => {
		this.setState({confirmDlg: false});
	}

	// submit has been confirmed, let the server know
	submitConfirm = async () => {
		this.setState({confirmDlg: false});

		const month = this.state.date.getMonth()+1;
		const year = this.state.date.getFullYear();
		const day = this.state.date.getDate();

		const options = {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				Month: month,
				Year: year,
				Day: day,
			})
		}

		fetch(UrlGet("WasteInputConfirm"), options)
			.then(r => this.loadItems())
	}
}
