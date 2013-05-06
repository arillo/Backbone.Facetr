// facet collections cache
var _collections = {};

// get a collection from the _collections hash based on the id
// passed as argument at the first Facetr invokation
var _getCollection = function(id) {
    var coll = _collections[id];
    if(coll) {
        return coll;
    }

    return undefined;
};

// checks if the given collection exists in the cache, if not creates a new FacetCollection with the given collection data
// adds a facetrid attribute to the original collection for quick lookup
var _begetCollection = function(collection, id) {
    var colid = collection.facetrid || id || 'fctr'+new Date().getTime()+Math.floor((Math.random()*99)+1),
        coll = _getCollection(colid);
    if(coll) {
        return coll;
    } else {
        collection.facetrid = colid;
        return _collections[colid] = new FacetCollection(collection);
    }
};

var _getValue = function(model, attr) {
    var value, tokens = attr.split('.'), len = tokens.length, i = 0;
    // iterate over possible properties of properties in order to allow Property.Property notation
    // if tokens length is 1, just return the Backbone.Model property value if any is found
    value = model.get(tokens[i]);

    for(i = 1; i < len; i += 1){
        if(value !== undefined){
            if(value instanceof Array){
                return value;
            } else if(value instanceof Backbone.Model){
                value = value.get(tokens[i]);
            } else if(Object.prototype.toString.call(value) === '[object Object]'){
                value = value[tokens[i]];
            } else {
                value = value;
            }
        } else {
            return value;
        }
    }

    return value;
};