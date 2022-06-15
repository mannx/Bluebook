import React from "react";
import "./dialog.css";

export default class DeleteDialog extends React.Component {
	render = () => {
		var visString = this.props.visible === true ? "block" : "none";

		return (<>
			<div className="Dialog" style={{display: visString}}>
				<div className="DialogContents">
					<p>Confirm Deletion of the following items: </p>
					<ul>
						{this.props.Items.map(function(obj) {
							return <li>{obj.Name}</li>;
						})}
					</ul>
					<button onClick={this.handleOk}>Confirm</button>
					<button onClick={this.close}>Close</button>
				</div>
			</div>
		</>);
	}

	close = () => {
		this.props.onClose();
	}

	handleOk = () => {
		this.props.onConfirm();
	}
}
