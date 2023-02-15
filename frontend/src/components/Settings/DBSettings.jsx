import React from "react";
import {UrlGet, GetPostOptions} from "../URLs/URLs.jsx";
import DialogBox from "../Dialog/DialogBox.jsx";

function RevertConfirmDialog(props) {
	var contents = (<>
		<h3>Revert Daily Entry's?</h3>
			<div>
			{props.ids.map(function(obj){
				for(var i = 0;i < props.data.Backup.length; i++) {
					if(props.data.Backup[i].ID === obj) {
						return <li>{props.data.Backup[i].DateString}</li>;
					}
				}

                return null;
			})}
		</div>
	</>);

	return (
		<DialogBox visible={props.visible} onClose={props.onClose} onConfirm={props.onConfirm} contents={()=>{return contents;}}/>
	);
}

function UndoConfirmDialog(props) {
	var contents = (<>
		<h3>Revert Daily Entry's?</h3>
			<div>
			{props.ids.map(function(obj){
				for(var i = 0;i < props.data.List.length; i++) {
					if(props.data.List[i].EntryID === obj) {
						return <li>{props.data.List[i].Item.DateString}</li>;
					}
				}

                return null;
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

			backupRevertList:[],		// list of items to revert changes to
			revertConfirm: false,		// display confirmation dialog?

			undoList: [],				// list of items to undo (no entry to revert changes)
			undoConfirm: false,			// display confirm dialog?

			confirmTags: false,

			emptyConfirm: false,		// display empty table dialog?
			error: false,
			errorMsg: null,

		}
	}

	loadData = async () => {
		const url = UrlGet("ImportBackupDev");
		const resp = await fetch(url);
		const data = await resp.json();

		this.setState({data: data});

        // can redef const?
        const url2 = UrlGet("DBBackupList");
        const resp2 = await fetch(url2);
        const data2 = await resp2.json();

        this.setState({dbBackup: data2});
	}

	componentDidMount = () => {
		this.loadData();
	}

	render = () => {
		var backup = null;
		var list = null;
        var db = null;

		if(this.state.data !== null ) { 
			backup = this.ShowBackupTable();
			list = this.ShowImportTable();
		}

        if(this.state.dbBackup !== null) { 
            db = this.ShowDBTable();
        }

		const error = this.state.errorMsg !== null ? <span class="ErrorMsg">{this.state.errorMsg}</span> : <span></span>;

		return (<>
			<fieldset><legend>
				<h3>Undo</h3></legend>
			{error}
			{this.ControlTable()}
			<div>
				{backup}
				{list}
                {db}
			</div>

			<RevertConfirmDialog visible={this.state.revertConfirm} onClose={()=>this.setState({revertConfirm: false})} onConfirm={this.ConfirmRevert} data={this.state.data} ids={this.state.backupRevertList}/>
			<UndoConfirmDialog visible={this.state.undoConfirm} onClose={()=>this.setState({undoConfirm: false})} onConfirm={this.ConfirmUndo} data={this.state.data} ids={this.state.undoList}/>
			<DialogBox visible={this.state.emptyConfirm} onClose={()=>this.setState({emptyConfirm: false})} onConfirm={this.ConfirmEmpty} contents={this.emptyContents}/>
			</fieldset>

			<fieldset>
				<legend><h3>Tag</h3></legend>
				<button onClick={this.emptyTags}>Clear Empty Tags</button>
				<DialogBox visible={this.state.confirmTags} onClose={()=>this.setState({confirmTags: false})} onConfirm={this.ConfirmTags} contents={this.tagsContents}/>
			</fieldset>
		</>);
	}

	revertButton = (func) => {
		return <button onClick={func}>Revert</button>;
	}

	ControlTable = () => {
		return (<>
			<div>
				<button onClick={this.emptyTables}>Empty Tables</button>
			</div>
		</>);
	}

	ShowBackupTable = () => {
		const btn = this.state.backupRevertList.length !== 0 ? this.revertButton(this.DoRevertBackup) : "";

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
		const btn = this.state.undoList.length !== 0 ? this.revertButton(this.DoUndo) : "";

		return (<>
			<table className="MyStyle">
				<caption><h3>New Imports <br/>{btn}</h3></caption>
				<thead>
					<tr className="MyStyle">
						<th className="MyStyle"></th>
						<th className="MyStyle">ID</th>
						<th className="MyStyle">Date</th>
					</tr>
				</thead>
				<tbody>
					{this.state.data.List.map(function(obj, i){
						const undef = this.state.undoList[i] !== undefined;
						const nil = this.state.undoList[i] !== null;
						const checked = undef && nil;

						return (<>
							<tr>
								<td><input type="checkbox" onChange={this.undoChecked} value={obj.EntryID} data-index={i} checked={checked}/></td>
								<td>{obj.EntryID}</td>
								<td>{obj.Item.DateString}</td>
							</tr>
						</>);
					},this)}
				</tbody>
			</table>
		</>);
	}

	backupChecked = (e) => {
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
	}

	DoRevertBackup = () => {
		// display a confirmation dialog that we do indeed want to revert the selected days
		// this should only be shown (and the button to click) if we have already selected an item
		this.setState({revertConfirm: true});
	}

	undoChecked = (e) => {
		var data = this.state.undoList;
		const id = e.target.dataset.index;

		if(data[id] === undefined || data[id] === null) {
			//add item to list
			data[id] = e.target.value;
		}else{
			// remove the item
			data[id] = null;
		}

		this.setState({undoList: data});
	}

	DoUndo = () => {
		this.setState({undoConfirm: true});
	}

	ConfirmRevert = () => {
		// get the list of id's to revert, remove all null entries
		this.sendToServer(this.state.backupRevertList.filter(n => n !== null), UrlGet("ImportBackupList"));

		// send request and clear the selected data
		this.setState({backupRevertList: [], revertConfirm: false});
	}

	ConfirmUndo = () => {
		this.sendToServer(this.state.undoList.filter(n => n !== null), UrlGet("ImportBackupUndo"));
		this.setState({undoList: [], undoConfirm: false});
	}

	sendToServer = (ids, url) => {
		var idList = [];

		for(var i = 0; i < ids.length; i++) {
			if( i !== null ) {
				const n = parseInt(ids[i],10);
				idList.push(n);
			}
		}

		// post the ids to the server and display result
		const options = GetPostOptions(JSON.stringify(idList));
		fetch(url, options)
			.then(r => r.json())
			.then(r => this.setState({errorMsg: r.Message,error: r.Error}));
	}

	emptyTables = () => {
		this.setState({emptyConfirm: true});
	}

	ConfirmEmpty = () => {
		const url = UrlGet("ImportBackupEmpty");
		const options = GetPostOptions(null);

		fetch(url,options)
			.then(r => r.json())
			.then(r => this.setState({errorMsg: r.Message, error: r.Error}));

		this.setState({emptyConfirm: false});
	}

	emptyContents = () => {
		return <div>Confirm empty backup/undo tables?</div>;
	}

	tagsContents = () => {
		return <div>Remove Unused Tags?</div>;
	}

	emptyTags = () => {
		this.setState({confirmTags: true});
	}

	ConfirmTags = () => {
		// remove unused tags from server
		const url = UrlGet("TagClean");
		fetch(url);	

		this.setState({confirmTags: false});
	}
}
