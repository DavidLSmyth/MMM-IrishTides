
//data is from https://erddap.marine.ie/erddap/tabledap/IMI-TidePrediction.html
const csv_module = require("csv-parser");
const fs = require("fs");
const today_results = [];
const today = new Date();
today.setHours(0,0,0,0);
let next5days = [];
for(i = 0; i <= 5; i++){
        let dt= new Date(); 
        dt.setDate(dt.getDate() + i); 
	dt.setHours(0,0,0,0);
        next5days.push(dt);
};
//convert to millis for comparison
//console.log(next5days);
next5days = next5days.map(date => date.getTime());
console.log("next5days");
console.log(next5days);

function match_data_next5_days(data){
        let date_to_match = new Date(data["time"]);
        date_to_match.setHours(0,0,0,0);
        if (next5days.includes(date_to_match.getTime())){
                return {"date": new Date(data["time"]).toLocaleString(), "height": data["0"]};
        }
        else{
                return null;
        }
}

function get_today_high_tides(){
	let return_array = [];
	fs.createReadStream("./data/high_tides_galway.csv")
	.pipe(csv_module())
	.on('data',(data) => {if(match_data_next5_days(data)){return_array.push(match_data_next5_days(data)); console.log(data);}})
	.on("end", () =>{});
	return return_array;
}

//console.log(today);
//console.log(match
/*fs.createReadStream("./data/high_tides_galway.csv")
.pipe(csv_module())
.on('data',(data) => {if(match_data(data)){console.log(match_data(data))}});
*/

//console.log(get_today_high_tides());


function get_tide_data_table_row(tide_data){
  return `<tr> 
   <td>${tide_data["time"].toLocaleTimeString()} ${tide_data["height"]}</td> 
   </tr>
`
}

function get_tides_table_for_day(tide_data){
 let returnString = `<table>
 <tr> 
   <td rowspan = "4">${tide_data[0]["time"].toDateString()}</td> 
 </tr>`
  tide_data.forEach(data => returnString = returnString.concat(get_tide_data_table_row(data)));  
returnString = returnString.concat("</table>");
  return returnString;
}

const groupBy = (array, key) => {
    // Return the reduced array
    return array.reduce((result, currentItem) => {
//      currentItem[key].setHours(0,0,0,0);
      // If an array already present for key, push it to the array. Otherwise create an array and push the object.
      (result[currentItem[key]] = result[currentItem[key]] || []).push( currentItem );
      // return the current iteration `result` value, this will be the next iteration's `result` value and accumulate
      return result;
    }, {}); // Empty object is the initial value for result object
  };


let tide_d = [];
tide_d.push({"time": new Date("2022-05-15 16:45:00+00:00"), "height":5.22, "type": "h", "date": new Date("2022-05-15")});
tide_d.push({"time": new Date("2022-05-15 22:35:00+00:00"), "height":0.5, "type": "l", "date": new Date("2022-05-15")});

tide_d.push({"time": new Date("2022-05-16 17:45:00+00:00"), "height":5.22, "type": "h", "date": new Date("2022-05-16")});
tide_d.push({"time": new Date("2022-05-16 21:35:00+00:00"), "height":0.5, "type": "l", "date": new Date("2022-05-16")});

let grouped = groupBy(tide_d, "date");
//console.log(grouped);
for (var key in grouped){
	console.log(get_tides_table_for_day(grouped[key]));
}

//let mapped = grouped.map(get_tides_table_for_day); 
//console.log(mapped);

//console.log(groupBy(tide_d, "date").map(get_tides_table_for_day));

//console.log(get_tides_table_for_day(tide_d))
