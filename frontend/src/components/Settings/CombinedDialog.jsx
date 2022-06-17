import React from "react";
import DialogBox from "../Dialog/DialogBox.jsx";
import "../Dialog/dialog.css";

export default class CombinedDialog extends React.Component {
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
			<p>Prearing to combine the following items.  Select which item to use a the destination item</p>
			<ul>
				{this.props.Items.map(function(obj) {
					return <li>{obj.Name}</li>;
				})}
			</ul>
		</>);
	}
}
