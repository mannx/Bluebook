import React from "react";
import "./dialog.css";

export default class CombinedDialog extends React.Component {
	render = () => {
		var visString = this.props.visible === true ? "block" : "none";

		return (<>
			<div className="Dialog" style={{display: visString}}>
				<div className="DialogContents">
					<p>Prearing to combine the following items.  Select which item to use a the destination item</p>
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
