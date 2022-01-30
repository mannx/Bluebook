import React from "react";
import TagData from "./TagData.jsx";
import UrlGet from "../URLs/URLs.jsx";

import "./style.css";

// Display the list of tags and if/when provided, the days that tag was used on
class ViewTags extends React.Component {
		constructor(props) {
				super(props);
	
				this.state = {
						currentTag: null,				// id of the current tag we are showing
						tagList: null,					// list of all tag data we have
						loading: true,
				}
		}

		loadData = async () => {
				// load the list of tags we have
				const url = UrlGet("Tags");
				const resp = await fetch(url);
				const data = await resp.json();

				this.setState({tagList: data, loading: false});
		}

		componentDidMount() {
				this.loadData();
		}

		render() {
				if(this.state.loading || this.state.tagList == null) {
						return <h1>Loading tag data...</h1>;
				}

				return (<>
						{this.tagList()}
						<TagData tagid={this.state.currentTag} />
				</>);
		}

		tagList = () => {
				return (
						<fieldset><legend>All Tags</legend>
								<div><ul className={"tagList"}>
								{this.state.tagList.map(function(obj, i) {
										return <li><button  className='tag' onClick={() => this.viewTag(obj.ID) }>{obj.Tag}</button></li>;
								}, this)}
								</ul></div>
						</fieldset>
				);
		}

		viewTag = (n) => {
				this.setState({currentTag: n});
		}
}

export default ViewTags;
