import React from "react";
import {UrlGet, GetPostOptions} from "../URLs/URLs.jsx";
import DialogBox from "../Dialog/DialogBox.jsx";

function RevertConfirmDialog(props) {
	var contents = (<>
		<h3>Revert Daily Entry's?</h3>
			<div>
			{props.ids.map(function(obj){
				//if(obj !== null) {
					for(var i = 0;i < props.data.Backup.length; i++) {
						if(props.data.Backup[i].ID == obj) {
							return <li>{props.data.Backup[i].DateString}</li>;
						}
					}
				//}
			})}
		</div>
	</>);

	return (
		<DialogBox visible={props.visible} onClose={props.onClose} onConfirm={props.onConfirm} contents={()=>{return contents;}}/>
	);
}

// DBSettings is used to provide admin help functions for cleaning
// up database entries, undo'ing imports, etc
export default class DBSettings extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			data: null,
			backupRevertList:[],
			revertConfirm: false,

			error: false,
			errorMsg: null,
		}
	}

	loadData = async () => {
		const url = UrlGet("ImportBackupDev");
		const resp = await fetch(url);
		const data = await resp.json();

		this.setState({data: data});
	}

	componentDidMount = () => {
		this.loadData();
	}

	render = () => {
		var backup = null;
		var list = null;

		if(this.state.data !== null ) { 
			backup = this.ShowBackupTable();
			list = this.ShowImportTable();
		}

		const error = this.state.errorMsg !== null ? <span class="ErrorMsg">{this.state.errorMsg}</span> : <span></span>;

		return (<>
			<h3>Undo</h3>
			{error}
			{this.ControlTable()}
			<div>
				{backup}
				{list}
			</div>

			<RevertConfirmDialog visible={this.state.revertConfirm} onClose={()=>this.setState({revertConfirm: false})} onConfirm={this.ConfirmRevert} data={this.state.data} ids={this.state.backupRevertList}/>
		</>);
	}

	revertButton = (func) => {
		return <button onClick={func}>Revert</button>;
	}

	ControlTable = () => {
		return (<>
			<div>
				<button>Empty Tables</button>
			</div>
		</>);
	}

	ShowBackupTable = () => {
		const btn=this.state.backupRevertList.length !== 0 ? this.revertButton(this.DoRevertBackup) : "";

		return (<>
			<table className="MyStyle">
				<caption><h3>Backup Day Data {btn}</h3></caption>
				<thead>
					<tr className="MyStyle">
						<th className="MyStyle"></th>
						<th className="MyStyle">ID</th>
						<th className="MyStyle">Date</th>
					</tr>
				</thead>
				<tbody>
					{this.state.data.Backup.map(function(obj,i){
						// only check the box if we something there
						const undef = this.state.backupRevertList[i] !== undefined;
						const nil = this.state.backupRevertList[i] !== null;
						const checked = undef && nil;

						return (<>
							<tr>
								<td><input type="checkbox" onChange={this.backupChecked} value={obj.ID} data-index={i} checked={checked}/></td>
								<td>{obj.ID}</td>
								<td>{obj.DateString}</td>
							</tr>
						</>);
					},this)}
				</tbody>
			</table>
		</>);
	}

	ShowImportTable = () => {
		return (<>
			<table className="MyStyle">
				<caption><h3>New Import List</h3></caption>
				<thead>
					<tr className="MyStyle">
						<th className="MyStyle">ID</th>
						<th className="MyStyle">Date</th>
					</tr>
				</thead>
				<tbody>
					{this.state.data.List.map(function(obj){
						return (<>
							<tr>
								<td>{obj.EntryID}</td>
								<td>{obj.Item.Date}</td>
							</tr>
						</>);
					})}
				</tbody>
			</table>
		</>);
	}

	backupChecked=(e)=>{
		// add the id to the list
		var data=this.state.backupRevertList;
		const id = e.target.dataset.index;

		if(data[id] === undefined || data[id] === null) {
			// add the item
			data[id] = e.target.value;
		}else{
			// remove the item
			data[id] = null;
		}

		this.setState({backupRevertList: data});
		console.log(data);
	}

	DoRevertBackup = () => {
		// display a confirmation dialog that we do indeed want to revert the selected days
		// this should only be shown (and the button to click) if we have already selected an item
		this.setState({revertConfirm: true});
	}

	ConfirmRevert = () => {
		// get the list of id's to revert, remove all null entries
		const ids = this.state.backupRevertList.filter(n => n !== null);
		var idList = [];

		for(var i = 0; i < ids.length; i++) {
			if( i !== null ) {
				const n = parseInt(ids[i],10);
				idList.push(n);
			}
		}

		// post the ids to the server and display result
		const options = GetPostOptions(JSON.stringify(idList));
		const url = UrlGet("ImportBackupRevert");

		fetch(url, options)
			.then(r=>r.json())
			.then(r => this.setState({errorMsg: r.Message,error: r.Error}));

		// send request and clear the selected data
		this.setState({backupRevertList: [], revertConfirm: false});
	}
}
