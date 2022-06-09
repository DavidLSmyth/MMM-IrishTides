/* Magic Mirror
 * Module: MMM-SimpleTides
 *
 * By Mykle1
 *
 */

//data is from https://erddap.marine.ie/erddap/tabledap/IMI-TidePrediction.html
const today_results = [];
const today = new Date();
today.setHours(0,0,0,0);


function get_tide_data_table_row(tide_data){
  let img = tide_data["type"]==="l" ? "low" : "high";
  return `<tr> 
   <td>${new Date(tide_data["time"]).toLocaleTimeString()} ${Number.parseFloat(tide_data["height"]).toFixed(2)}m <img class = img src=modules/MMM-IrishTides/images/${img}.png width=12% height=12%</td> 
   </tr>
`
}

function get_tides_table_for_day(tide_data){
	console.log("gttfd");
	console.log(tide_data);
        let table = document.createElement("table");

 let returnString = `<tr> 
   <td rowspan = "5">${new Date(tide_data[0]["time"]).toDateString()} </td> 
 </tr>`
  tide_data.forEach(data => returnString = returnString.concat(get_tide_data_table_row(data)));  
  	table.innerHTML = returnString + "<hr>";
	return table;
}


const groupBy = (array, key) => {
    // Return the reduced array
    return array.reduce((result, currentItem) => {
      // If an array already present for key, push it to the array. Otherwise create an array and push the object.
      (result[currentItem[key]] = result[currentItem[key]] || []).push( currentItem );
      // return the current iteration `result` value, this will be the next iteration's `result` value and accumulate
      return result;
    }, {}); // Empty object is the initial value for result object
  };


function generate_tide_row_html(tide_data){
                // Tide #2 = High/Low icon, day of the week, time of tide (am/pm)
        let date = document.createElement("div");
        date.classList.add("xsmall", "bright", "date");
        let img = tide_data["type"]==="l" ? "low" : "high";
	console.log("tide data");
	console.log(tide_data);
	date.innerHTML = `<img class = img src=modules/MMM-IrishTides/images/${img}.png width=12% height=12%>` + " &nbsp " + tide_data.date + "&nbsp" + tide_data["height"] + "m"; 
	console.log(date);
	return date;
}
 

Module.register("MMM-IrishTides", {

    // Module config defaults.
    defaults: {
       useHeader: false,              // False if you don't want a header      
        header: "",                    // Change in config file. useHeader must be true
        maxWidth: "300px",
        animationSpeed: 3000,          // fade speed
        initialLoadDelay: 3250,
        retryDelay: 2500,
        updateInterval: 12 * 60 * 60 * 1000, // Twice a day = 1000ms = 1s * 60 = 1 minute * 60 = 1hr * 12 = 12hr
    },


    getStyles: function() {
        return ["MMM-IrishTides.css"];
    },


    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name);

	this.tides = [];
        this.today = "";
        this.scheduleUpdate();
    },


    getDom: function() {
        var tides = this.tides;
        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

		// Loading . . .
        if (!this.loaded) {
            wrapper.classList.add("wrapper");
            wrapper.innerHTML = "Getting tides";
            wrapper.className = "bright light small";
            return wrapper;
        }

		// header
        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "header");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }

        var top = document.createElement("div");
        top.classList.add("list-row");


        // place
        var place = document.createElement("div");
        place.classList.add("small", "bright", "place");
        place.innerHTML = "Galway Tides" + "<hr>";
        top.appendChild(place);
	let tides_grouped_by_date = groupBy(tides, "date");
	console.log(tides_grouped_by_date);
	for (var key in tides_grouped_by_date){
		top.appendChild(get_tides_table_for_day(tides_grouped_by_date[key]));
	}
		
        wrapper.appendChild(top);
        return wrapper;
    },


    processTides: function(data) {
        this.station = "Galway"; // before extremes object
        this.tides = data; // Object
        this.loaded = true;
    //	console.log(this.tides); // for checking
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getTides();
        },this.config.updateInterval);
        this.getTides(this.config.initialLoadDelay);
    },

    getTides: function() {
        this.sendSocketNotification('GET_TIDES');
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "TIDES_RESULT") {
	    console.log("recieved tide data");
	    console.log(payload);
            this.processTides(payload);
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },

});
