import React  from "react";
import NumberFormat from "react-number-format";
import UrlGet from "../URLs/URLs.jsx";
import "./table.css";
import "./eow.css";

//
//	This is used to draw a single row and fill in its data
//	
class TableCell extends React.Component {

		commentURL = UrlGet("Comment");
		tagURL = UrlGet("TagEditPost");

		constructor(props) {
				super(props);

				this.state = {
					editComment: false,
					editTag: false,
					tagFunc: props.searchTag,
					comment: this.props.data.Comment,
					tag: null,
				}

				var tag = "";
				if(this.props.data.Tags !== null) {
						tag = this.props.data.Tags.join(" ");
				}

				this.setState({tag: tag});

		}

		// Output a NumberFormat
		NF(obj, prefix="", suffix="") {
				return (
						<NumberFormat
						value={obj}
						displayType={"text"}
						thousandSeparator={true}
						prefix={prefix}
						suffix={suffix}
						decimalScale={2}
						fixedDecimalScale={true}
						/ >
				);
		}


		// output a general number
		O(obj) {
				return this.NF(obj);
		}

		P(obj) { return this.NF(obj, "","%"); }		// output a percent
		Dol(obj) {return this.NF(obj,"$",""); }

		// zero pad a number to 2 places
		Zero(obj) {
				var s = "00" + obj;
				return s.substr(s.length-2);
		}

		render() {
				var cls = "";


				switch(this.props.data.SalesLastWeek) {
						case 1:	cls="NetSalesUp"; break;
						case -1: cls="NetSalesDown"; break;
						default: cls="NetSalesSame"; break;
				}

				//<!-- <td className={cls}>{this.O(this.props.data.NetSales)}</td> -->
				return (
						<tr>
								<td>{this.Zero(this.props.data.DayOfMonth)}</td>
								<td>{this.props.data.DayOfWeek}</td>
								<td>{this.O(this.props.data.GrossSales)}</td>
								<td>{this.O(this.props.data.HST)}</td>
								<td>{this.O(this.props.data.BottleDeposit)}</td>
								<td className={cls}><div className="tooltip">{this.O(this.props.data.NetSales)}<span className="tooltiptext">{this.O(this.props.data.WeeklyAverage)}</span></div></td>
								<td className="div"></td>

								<td>{this.O(this.props.data.DebitCard)}</td>
								<td>{this.O(this.props.data.Visa)}</td>
								<td>{this.O(this.props.data.MasterCard)}</td>
								<td>{this.O(this.props.data.Amex)}</td>
								<td>{this.O(this.props.data.CreditSales)}</td>
								<td className="div"></td>

								<td>{this.O(this.props.data.GiftCardRedeem)}</td>
								<td>{this.O(this.props.data.GiftCardSold)}</td>
								<td className="div"></td>

								<td>{this.O(this.props.data.HoursWorked)}</td>
								<td>{this.O(this.props.data.Productivity)}</td>
								<td>{this.O(this.props.data.Factor)}</td>
								<td>{this.O(this.props.data.AdjustedSales)}</td>
								<td>{this.O(this.props.data.CustomerCount)}</td>
								<td>{this.P(this.props.data.ThirdPartyPercent)}</td>
								<td>{this.Dol(this.props.data.ThirdPartyDollar)}</td>
								<td className="div"></td>

								<td onDoubleClick={this.editComment} >{this.commentField()}</td>
								<td onDoubleClick={this.editTag} >{this.tagField()}</td>
						</tr>
				);
		}

		commentField = () => {
			if(this.state.editComment === false) {
				return <div className="comment"  >{this.state.comment}</div>;
			}else{
				return (
						<form onSubmit={this.submitComment} >
							<input type={"text"} name={"comment"} defaultValue={this.state.comment} onChange={this.commentChange}/>
							<input type={"submit"} value={"Update"} />
						</form>
				);
			}
		}

		submitComment = (event) => {
				event.preventDefault();

				// state.comment is the comment to save
				// state.linkedid is the comment id if updating, 0 otherwise
				const body = {
						Comment: this.state.comment,
						LinkedID: this.props.data.ID,
						Date: this.props.data.Date,
				}

				const options = {
						method: 'POST',
						headers: {'Content-Type':'application/json'},
						body: JSON.stringify(body)
				};

				fetch(this.commentURL, options)
						.then(r => this.setState({editComment: !this.state.editComment}))
						.then(r => console.log(r))

		}

		submitTag = (e) => {
			e.preventDefault();

			const body = {
				Tag: this.state.tag,
				LinkedID: this.props.data.ID,
				Date: this.props.data.Date,
			}

			const options = {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(body)
			};

			fetch(this.tagURL, options)
				.then(e => {
					// attempting to display any returned error message
					// have server return json object consistenitly?
					const r = e.text();
					console.log("error: " + r)
				});

			this.setState({editTag: !this.state.editTag});
		}

		editComment = () => {
				this.setState({editComment: !this.state.editComment});
		}

		commentChange = (e) =>  {
				this.setState({comment: e.target.value});
		}

		tagField = () => {
			if(this.state.editTag === false) {
				if(this.props.data.Tags !== null) {
					return (<div className='tag'>
						{this.props.data.Tags.map(function (obj, i) {
							return <button className="tagButton" onClick={(e) => this.tagClick(e)} data-id={this.props.data.TagID[i]}>#{obj} </button>;
						}, this)}
					</div>);
				}
			}else{
				return (
					<form onSubmit={this.submitTag} >
						<input type={"text"} name={"tag"} defaultValue={this.state.tag} onChange={this.tagChange}/>
						<input type={"submit"} value={"Update"} />
					</form>
				);
			}
		}

		tagClick = (e) => {
				console.log(e.target.textContent);
				
				let n = parseInt(e.target.attributes["data-id"].nodeValue);
				this.props.searchTag(n);
		}

		editTag = () => {this.setState({editTag: !this.state.editTag});}

		tagChange = (e) => {this.setState({tag: e.target.value});}
}

export default TableCell;
