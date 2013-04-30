(function (root, factory) {
    if (typeof exports === 'object') {

        var underscore = require('underscore');
        var backbone = require('backbone');

        module.exports = factory(root, underscore, backbone);

    } else if (typeof define === 'function' && define.amd) {

        define(['underscore', 'backbone'], factory);

    } else {

        factory(root, _, Backbone);

    }
}(this, function (global, _, Backbone, undefined) {
    "use strict";

    // create Facetr function as Backbone property
    // create a global reference of Facetr for convenience
    // when adding a collection, an id can be associated with it
    // future call to Facetr can use either the Backbone.Collection instance
    // as paramter or the given id to retrieve the FacetCollection
    Backbone.Facetr = function(collection, id) {
        if(collection instanceof Backbone.Collection) {
            return _begetCollection(collection, id);
        } 
	
        return _getCollection(collection);
    };

    Backbone.Facetr.VERSION = '0.2.3';

    //= facetr.helpers.js
    //= facetr.facet.js
    //= facetr.facetcollection.js

    if(global){
        global.Facetr = Backbone.Facetr;
    }

    return Backbone.Facetr;
}));