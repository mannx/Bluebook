import React from "react";
import "./dialog.css";

export default class DialogBox extends React.Component {
	render = () => {
		var visString = this.props.visible === true ? "block" : "none";

		return (<>
			<div className="Dialog" style={{display: visString}}>
				<div className="DialogContents">
					{this.props.contents()}
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
