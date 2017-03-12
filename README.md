# firebase-functions-hexastore
Experimental Firebase Cloud Function to maintain a hexastore Graph model

With the release of firebase cloud functions, I wanted to automate the creation / maintence of a "Hexastore" Graph model. 

Hexastore is based on this [research paper](http://karras.rutgers.edu/hexastore.pdf). It is a way to structure RDF data such that queries are really fast. However, as implemented here, it has a 6 fold increase in memory usage as compared to a naive implementation of a triple store.

This function monitors an `entities` node for any object that contains a `graph` array of strings in format of **${PREDICATE}/${OBJECT}** (with the subject being inferred from the parent entity). 
It then creates the following 6 endpoints
```
GRAPH/SPO/${SUBJECT}/${PREDICATE}/${OBJECT}: true
GRAPH/SOP/${SUBJECT}/${OBJECT}/${PREDICATE}: true
GRAPH/OPS/${OBJECT}/${PREDICATE}/${SUBJECT}: true
GRAPH/OSP/${OBJECT}/${SUBJECT}/${PREDICATE}: true
GRAPH/PSO/${PREDICATE}/${SUBJECT}/${OBJECT}: true
GRAPH/POS/${PREDICATE}/${OBJECT}/${SUBJECT}: true
```

![firebase hex tree](http://jlpublicimg.s3.amazonaws.com/firebae-hexastore.png)

If a record is edited or deleted it should clean up after itself in the graph index as well.

The next step might be to create a query function that accepts one or more SPO paths, performs some set operations and returns the results.
This would allow for fairly rich entity relationship queries with nice denormalized data structures.  

Pull Requests Welcome!
