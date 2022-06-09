/* Magic Mirror
 * Module: MMM-SimpleTides
 *
 * By Mykle1
 *
 */
const NodeHelper = require('node_helper');
//data is from https://erddap.marine.ie/erddap/tabledap/IMI-TidePrediction.html
const csv_module = require("csv-parser");
const fs = require("fs");
const no_days = 3;

function get_today(){
	let today = new Date();
	today.setHours(0,0,0,0);
	return(today);
}

function get_next_days(no_days){
	let next_days = [];
	for(i = 0; i < no_days; i++){
		let dt= new Date(); 
		dt.setDate(dt.getDate() + i); 
		dt.setHours(0,0,0,0);
		next_days.push(dt);
	};
	next_days = next_days.map(date => date.getTime());
	return(next_days);
}

function match_data_next_days(data, no_days){
	let next_days = get_next_days(no_days);
	let date_to_match = new Date(data["time"]);
	date_to_match.setHours(0,0,0,0);
	if (next_days.includes(date_to_match.getTime())){
		return {"time": new Date(data["time"]).toLocaleString(), "height": data["height"], "type": data["type"], "date": new Date(data["date"])};
	}
	else{
		return null;
	}
}

function createHighTideObject(data){
	//given an existing object with time and tide height, adds on missing data to render nicely
	data["dt"] = data["time"];
	data["type"] = "high";
	data["height"] = data["0"];
}

module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for: " + this.name);
    },

    getTides: function() {
	let return_array_high = [];
        //console.log(process.cwd());
        fs.createReadStream("./modules/MMM-IrishTides/data/tides_all.csv")
        .pipe(csv_module())
        .on('data',(data) => {if(match_data_next_days(data, no_days)){return_array_high.push(match_data_next_days(data, no_days));}}) //console.log(match_data(data));}})
        .on("end", () =>{this.sendSocketNotification('TIDES_RESULT', return_array_high);})	
    },

    socketNotificationReceived: function(notification) {
        if (notification === 'GET_TIDES') {
            this.getTides();
        }
    }
});
