
export default function FormatUTC(dateInt, addOffset = false) {
		let date=(!dateInt||dateInt.length<1)?new Date():new Date(dateInt);
		if (typeof dateInt === "string"){
			return date;
		}else{
			const offset=addOffset?date.getTimezoneOffset():-(date.getTimezoneOffset());
			const offsetDate=new Date();
			offsetDate.setTime(date.getTime()+offset*60000);
			return offsetDate;
		}
}
