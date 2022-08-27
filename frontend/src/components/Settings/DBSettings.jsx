import React from "react";


// DBSettings is used to provide admin help functions for cleaning
// up database entries, undo'ing imports, etc
export default class DBSettings extends React.Component {
	constructor(props) {
		super(props);
	}

	render = () => {
		return (<>
			<h3>Undo</h3>
			<div>
				Undo previous import operation: <button>Undo</button><br/>
				Clear undo table: <button>Clear Undo</button>
			</div>
		</>);
	}
}
