import React from "react";
import DialogBox from "./DialogBox.jsx";
import "./dialog.css";

export default class AddDialog extends React.Component {
	render = () => {
		return (
			<DialogBox
				visible={this.props.visible}
				onClose={this.props.onClose}
				onConfirm={this.props.onConfirm}
				contents={this.contents}
			/>
		);
	}

	contents = () => {
		return (<>
			<p>Add New Wastage Item Below:</p>
			<div>
				Name: <input type="text"/><br/>
				Unit Type: 
			</div>
		</>);
	}
}
