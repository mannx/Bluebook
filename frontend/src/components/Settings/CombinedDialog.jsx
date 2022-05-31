import React from "react";
import "./dialog.css";

export default class CombinedDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			target: null,				// the id of the target item to convert all to
		}
	}

	render = () => {
		return (
			<div className="modal">
				<div className="modalContent">
					<p>Preparing to combine the following items.  Select which item to use as the destination item</p>
					<ul>
					{this.props.items.map(function(obj) {
						return <li>{obj}</li>;
					})}
					</ul>
					<button onClick={this.close}>Close</button>
				</div>
			</div>
		);
	}

	close = () => {
	}
}
