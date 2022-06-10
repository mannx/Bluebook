import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import 'bootstrap/dist/css/bootstrap.min.css';

export default class DeleteDialog extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			visible: this.props.visible,
		}
	}

	setVisible = (val) => {this.setState({visible:val});}
	show = () => {this.setVisible(true);}
	hide = () => {this.setVisible(false);}

	render = () => {
		return (<>
			<Modal show={this.state.visible} onHide={this.hide}>
				<Modal.Body>Modal Body Text Here</Modal.Body>
				<Modal.Footer>
					<Button variant="primary" onClick={this.handleClose}>Close</Button>
				</Modal.Footer>
			</Modal>
		</>);
	}

	close = () => {
	}

	handleClose = () => {
		this.setState({visible: false});
		this.props.onClose();
	}
}
