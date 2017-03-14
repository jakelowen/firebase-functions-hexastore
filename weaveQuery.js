var _ = require('lodash')
var firebase = require("firebase");

// Initialize Firebase
var config = {
	apiKey: "AIzaSyBlcUmAe-bKfAnIFtxgjFweqVaCw3KPt18",
	authDomain: "hexastore-test.firebaseapp.com",
	databaseURL: "https://hexastore-test.firebaseio.com",
	storageBucket: "hexastore-test.appspot.com",
	messagingSenderId: "999451438665"
};
firebase.initializeApp(config);

var db = firebase.database()

var refPathsQuery = ["GRAPH/POS/LIKES/PYTHON/","|GRAPH/POS/LIKES/CAKE/","&GRAPH/POS/HATES/COCONUT/","-GRAPH/POS/RUNS/FAST/"]
var refs = []
// var data = {
// 	"|": [],
// 	"&": [],
// 	"-": [],
// 	"entities":{},
// 	"final":[]
// }
var queryComponentResults = {}

_.map(refPathsQuery, pathQuery => {
	var path = null
	var op = null
	if ( ['|','&','-'].indexOf( pathQuery.charAt(0) ) !== -1 ) {
		path = pathQuery.substr(1)
		op = pathQuery.charAt(0)
    } else {
    	path = pathQuery.substr(0)
    	op = "|"
    }
    var results = []
	var listenPath = firebase.database().ref(path);
	var fn = listenPath.on('value', snapshot => {
		fetched_data = snapshot.val()
		queryComponentResults[pathQuery] = {op: op, data:fetched_data}
		
		if (_.keys(queryComponentResults).length == refPathsQuery.length){
			
			// console.log("data is fully loaded")
			var queryEntities = {}
			var ops = {}
			_.map(_.keys(queryComponentResults), pq => {
				queryEntities = _.assign(queryEntities, queryComponentResults[pq].data)
				ops = _.assign(ops, {[queryComponentResults[pq].op]: _.keys(queryComponentResults[pq].data)})
			})
			var setOps = _.difference(
				_.intersection(
					ops["|"], 
					ops["&"]
				), 
				ops["-"]
			)
			_.map(_.difference(setOps, results), key => {
				console.log("add", {[key]: queryEntities[key]})
			})
			_.map(_.difference(results,setOps), key => {
				console.log("remove", {[key]: queryEntities[key]})
			})
			// console.log("Add new records", _.difference(setOps, results))
			// console.log("Remove records", _.difference(results,setOps))
			results = _.map(setOps, _.clone)

			// console.log(queryComponentResults)
			// console.log(queryEntities)
			// console.log(ops)
			// console.log(setOps)
			console.log("___________________________________________________")
		}

		

		// data.final = results

		// console.log(data)
		// console.log("___________________________________________________")
	})
	refs.push(fn)
});


