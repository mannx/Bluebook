import React from "react";
import UrlGet from "../URLs/URLs.jsx";

export default class TagData extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			data: null,
		}
	}

	loadData = async () => {
		// loads the currently selected tag data from the server
		if(this.props.tagid === null) return;			// nothing to load

		const url = UrlGet("TagData") + "?id=" + this.props.tagid;
		const resp = await fetch(url);
		const data = await resp.json();

		this.setState({data: data, loading: false});
	}

	componentDidMount() {
		this.loadData();
	}

	componentDidUpdate(newProps) {
		if(newProps.tagid !== this.props.tagid) {
		this.loadData();
		}
	}

	render() {
		return (
			<fieldset><legend>Tag Result</legend>
				{this.showResult()}
			</fieldset>
		);
	}

	showResult = () => {
		if(this.state.loading || this.state.data == null){
			return <h1>Loading tag data...</h1>;
		}

		return (
			<table>
				<thead><tr>
					<th>Date</th>
					<th>Net Sales</th>
					<th>Comments</th>
					<th>Tags</th>
				</tr></thead>
				<tbody>
					{this.state.data.map(function(obj,i) {
						return (<tr>
							<td>{obj.Date}</td>
							<td>{obj.Day.NetSales}</td>
							<td>{obj.Day.Comment}</td>
							<td>{this.tag(obj.Tags)}</td>
						</tr>);
					}, this)}
				</tbody>
			</table>
		);
	}

	tag = (lst) => {
		if(lst === null) { return; }

		return lst.map(function(obj, i) {
			return <button className="tagButton">#{obj} </button>;
		});
	}
}
