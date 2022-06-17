import React from "react";
import DialogBox from "../Dialog/DialogBox.jsx";
import "../Dialog/dialog.css";

export default class CombinedDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selected: null,
		}
	}

	render = () => {
		return (
			<DialogBox 
				visible={this.props.visible}
				onClose={this.props.onClose}
				onConfirm={this.onConfirm}
				contents={this.contents}
			/>
		);
	}

	contents = () => {
		return (<>
			<p>Prearing to combine the following items.  Select which item to use a the destination item</p>
			<ul>
				{this.props.Items.map(function(obj) {
					return (<>
						<input type="radio" name="combine" id={obj.Id} value={obj.Id} onChange={this.selectionChanged}/>
						<label htmlFor={obj.Id}>[{obj.Count}] {obj.Name}</label><br/>
					</>);
				}, this)}
			</ul>
		</>);
	}

	selectionChanged = (e) => {
		this.setState({selected: parseInt(e.target.value)});
	}

	onConfirm = () => {
		this.props.onConfirm(this.state.selected);
	}
}
