import React from "react";
import UrlGet from "../URLs/URLs.jsx";

// DBSettings is used to provide admin help functions for cleaning
// up database entries, undo'ing imports, etc
export default class DBSettings extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			data: null,
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

		if(this.state.data !== null) {
			backup = this.ShowBackupTable();
			list = this.ShowImportTable();
		}

		return (<>
			<h3>Undo</h3>
			<div>
				{backup}
				{list}
			</div>
		</>);
	}

	ShowBackupTable = () => {
		return (<>
			<table className="MyStyle">
				<caption><h3>Backup Day Data</h3></caption>
				<thead>
					<tr className="MyStyle">
						<th className="MyStyle">ID</th>
						<th className="MyStyle">Date</th>
					</tr>
				</thead>
				<tbody>
					{this.state.data.Backup.map(function(obj,i){
						return (<>
							<tr>
								<td>{obj.ID}</td>
								<td>{obj.Date}</td>
							</tr>
						</>);
					})}
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
}
