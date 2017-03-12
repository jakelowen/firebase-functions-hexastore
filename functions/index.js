const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const _ = require('lodash');


function generateGraphPoints(entityId, item, value) {
	// Split item on /
	var SPO = item.split('/')
	SPO.unshift(entityId)
	var updates = {
		[`GRAPH/SPO/${SPO[0]}/${SPO[1]}/${SPO[2]}`]: value,
		[`GRAPH/SOP/${SPO[0]}/${SPO[2]}/${SPO[1]}`]: value,
		[`GRAPH/OPS/${SPO[2]}/${SPO[1]}/${SPO[0]}`]: value,
		[`GRAPH/OSP/${SPO[2]}/${SPO[0]}/${SPO[1]}`]: value,
		[`GRAPH/PSO/${SPO[1]}/${SPO[0]}/${SPO[2]}`]: value,
		[`GRAPH/POS/${SPO[1]}/${SPO[2]}/${SPO[0]}`]: value,
	};
	return updates
}

exports.indexGraph = functions.database.ref('/entities/{entityId}/')
    .onWrite(event => {

		var deletes = {}
		var updates = {}

	  	// get data
	  	const data = event.data.val();
	  	console.log("CURRENT DATA", data)
	  	if (event.data.previous.exists()) {
	  		var previousData = event.data.previous.val()
	  		console.log("PREVIOUS DATA", previousData)
	  		// iterate over previous data to populate deletes
	  		_.map(previousData.graph, (item) => {
		      	var permutations = generateGraphPoints(event.params.entityId, item, null)
		      	Object.assign(deletes, permutations)
		    });
	  	}
	  	// Iterate over new data to populate updates
	  	var updateTime = new Date().getTime()
	  	_.map(data.graph, (item) => {
	      	var permutations = generateGraphPoints(event.params.entityId, item, updateTime)
	      	console.log("permutations", permutations)
	      	Object.assign(updates, permutations)
	    });
	    // MERGE DELETES AND UPDATES TOGETHER MAKING SURE UPDATES OVERWRITES DELETS
	    var mergedUpdates = Object.assign({},deletes,updates)
	    console.log("MERGED UPDATES", mergedUpdates)
	    return admin.database().ref().update(mergedUpdates)
    });
