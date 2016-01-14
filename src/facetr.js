(function (root, factory) {
    if (typeof exports === 'object') {
        // node.js
        var underscore = require('underscore');
        var backbone = require('backbone');

        module.exports = factory(underscore, backbone);
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(['underscore', 'backbone'], factory);
    } else {
        root.Facetr = factory(_, Backbone);
    }
}(this, function (_, Backbone, undefined) {
    "use strict";

    // create Facetr function as Backbone property
    // when adding a collection, an id can be associated with it
    // future call to Facetr can use either the Backbone.Collection instance
    // as paramter or the given id to retrieve the FacetCollection
    Backbone.Facetr = function(collection, id) {
        if(collection instanceof Backbone.Collection) {
            return _begetCollection(collection, id);
        }
        return _getCollection(collection);
    };

    Backbone.Facetr.VERSION = '0.4.1';

    //= facetr.helpers.js
    //= facetr.facet.js
    //= facetr.facetcollection.js

    return Backbone.Facetr;
}));