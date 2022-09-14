import React from "react";
import UrlGet from "../URLs/URLs.jsx";

// DBSettings is used to provide admin help functions for cleaning
// up database entries, undo'ing imports, etc
export default class DBSettings extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			data: null,
			backupRevertList:[],
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

		return (<>
			<h3>Undo</h3>
			{this.ControlTable()}
			<div>
				{backup}
				{list}
			</div>
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
						return (<>
							<tr>
								<td><input type="checkbox" onChange={this.backupChecked} value={obj.ID} data-index={i}/></td>
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
	}
}
