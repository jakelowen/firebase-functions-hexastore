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

// Special syntax that includes FB path AND the set operation to perform 
// | = or (deafault), & = INTERSECTION, - = difference
var refPathsQuery = ["GRAPH/POS/LIKES/PYTHON/","|GRAPH/POS/LIKES/CAKE/","&GRAPH/POS/HATES/COCONUT/","-GRAPH/POS/RUNS/FAST/"]
// will store the event listeners. useful for unbinding later
var refs = []
// container for the raw query results
var queryComponentResults = {}
// iterate over query components.
_.map(refPathsQuery, pathQuery => {
	// extract the path and set operation required
	var path = null
	var op = null
	if ( ['|','&','-'].indexOf( pathQuery.charAt(0) ) !== -1 ) {
		path = pathQuery.substr(1)
		op = pathQuery.charAt(0)
    } else {
    	path = pathQuery.substr(0)
    	op = "|"
    }
    var results = [] // probably can eliminate in React
	var listenPath = firebase.database().ref(path);
	// Subscribe to changes on each path
	var fn = listenPath.on('value', snapshot => {
		fetched_data = snapshot.val()
		queryComponentResults[pathQuery] = {op: op, data:fetched_data}
		
		// Wait until all queries have ran at least once 
		// so we can peform set ops on complete data set
		if (_.keys(queryComponentResults).length == refPathsQuery.length){
			// console.log("data is fully loaded")
			var queryEntities = {}
			var ops = {}
			// iterate over the results of each set of results
			_.map(_.keys(queryComponentResults), pq => {
				// create one master lookup so we can easily lookup the timestamp of 
				//each record involved in query
				queryEntities = _.assign(queryEntities, queryComponentResults[pq].data)
				// This simplifies the data structure for the set operations that are about to happen
				// by grouping each kind of set operation together.
				ops = _.assign(ops, {[queryComponentResults[pq].op]: _.keys(queryComponentResults[pq].data)})
			})
			// perform actual set operations to get results
			var setOps = _.difference(
				_.intersection(
					ops["|"], 
					ops["&"]
				), 
				ops["-"]
			)

			// In react / redux, I probably need to do a .getstate to get the existing records in state 
			// for comparison ops. Currently comparison ops are just done against the last
			// record load.

			// What records are new?
			_.map(_.difference(setOps, results), key => {
				// I think in React/Redux I will make these seperate Action calls that
				// A) compare timestamp to record in store.
				// B) add / remove records from store as necessary
				// C) do .once queries to load records as necessary from id 
				console.log("add", {[key]: queryEntities[key]})
			})

			// Which records are no longer in results?
			_.map(_.difference(results,setOps), key => {
				// I think in React/Redux I will make these seperate Action calls
				// A) compare timestamp to record in store.
				// B) add / remove records from store as necessary
				// C) do .once queries to load records as necessary from id 
				console.log("remove", {[key]: queryEntities[key]})
			})

			// Record final results for comparison on next iteration.
			// IN react/REdux probably can eliminate this.
			results = _.map(setOps, _.clone)

			// console.log(queryComponentResults)
			// console.log(queryEntities)
			// console.log(ops)
			// console.log(setOps)
			console.log("___________________________________________________")
		}
	})
	refs.push(fn)
});


