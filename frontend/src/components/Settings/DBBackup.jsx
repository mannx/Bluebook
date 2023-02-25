import React from "react";
import {UrlGet, GetPostOptions} from "../URLs/URLs.jsx";
import DialogBox from "../Dialog/DialogBox.jsx";

export default class DBBackup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,

            removeConfirm: false,
            restoreConfirm: false,

            errorMsg: null,

            removeID: null,         // id of the db we are removing
            restoreID: null,        // id of the db we are restoring
        }
    }

	loadData = async () => {
        const url = UrlGet("DBBackupList");
        const resp = await fetch(url);
        const data = await resp.json();

        this.setState({data: data});
    }

    componentDidMount = () => {
        this.loadData();
    }

	render = () => {
        if(this.state.data === null) { 
            return <h1>Loading...</h1>;
        }

		const error = this.state.errorMsg !== null ? <span class="ErrorMsg">{this.state.errorMsg}</span> : <span></span>;

		return (<>
			{error}
			<div>
                {this.ShowDBTable()}
			</div>

            <DialogBox visible={this.state.removeConfirm} onClose={this.onRemoveClose} onConfirm={this.onRemoveOK} contents={this.removeContents}/>

            </>);
    }

    onRemoveClose = () => {
        this.setState({removeConfirm: false});
    }

    onRemoveOK = () => {
        // tell server to remove the backup
        const body = {
            ID: this.state.data[this.state.removeID].ID,
            Remove: true
        };

        const opts = GetPostOptions(JSON.stringify(body));
        const url = UrlGet("DBBackupRemove");

        fetch(url,opts)
            .then(r=>r.json())
            .then(r=>this.setState({errorMsg: r.Message, error: r.Error}));

        // close the window
        this.onRemoveClose();
    }

    removeContents = () => {
        const obj = this.state.data[this.state.removeID];
        if(obj === undefined || obj === null) {
            // bad id, display error
            return <><span>Error!</span></>;
        }

        const fileName = obj.FileName;
        return (<>
            <h3>Remove Backup?</h3>
            <span>Filename: {fileName}</span><br/>
            </>);
    }

    ShowDBTable = () => {
        return (<>
            <table className="MyStyle">
                <caption><h3>Database Backups</h3></caption>
                <thead>
                    <tr className="MyStyle">
                        <th className="MyStyle">File Name</th>
                        <th className="MyStyle">Remove</th>
                        <th className="MyStyle">Restore</th>
                    </tr>
                </thead>
                <tbody>
                {this.state.data.map(function(obj,i) {
                    return (<>
                        <tr>
                        <td>{obj.FileName}</td>
                        <td><button onClick={this.dbBackupRemove} data-index={i}>Remove</button></td>
                        <td><button onClick={this.dbBackupRestore} data-index={i}>Restore</button></td>
                        </tr>
                        </>);
                }, this)}
            </tbody>
            </table>
            </>);
    }

    dbBackupRemove = (e) => {
        const index = e.target.dataset.index;
        // console.log("remove " + index);

        // const obj = this.state.data[index];
        // return;

        this.setState({removeID: index, removeConfirm: true});
    }

    dbBackupRestore = (e) => {
        const index = e.target.dataset.index;
        if(index === undefined || index === null) {
            console.log("index undefined");
            return;
        }

    }

}
