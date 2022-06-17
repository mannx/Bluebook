import React from "react";
import DialogBox from "../Dialog/DialogBox.jsx";
import "../Dialog/dialog.css";

export default class DeleteDialog extends React.Component {
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
			<p>Confirm Deletion of the following items: </p>
			<ul>
				{this.props.Items.map(function(obj) {
					return <li>{obj.Name}</li>;
				})}
			</ul>
		</>);
	}
}
