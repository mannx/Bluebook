import React from "react";
import "./dialog.css";

export default class DeleteDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		}
	}

	render = () => {
		return (
			<div>
				<div >
					<span>Preparing to delete the following wastage items:</span>
					<ul>
						{this.props.items.map(function(obj) {
							return <li>{obj.Name}</li>;
						})}
					</ul>
				</div>
			</div>
		);
	}

	close = () => {
	}
}
