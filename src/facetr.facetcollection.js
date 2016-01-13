// FacetCollection class 
var FacetCollection = function(collection) {
    // give FacetCollection instances ability to handle Backbone Events
    _.extend(this, Backbone.Events);
    
    // init local variables
    var _self = this,
        _facets = {}, // facets list
        _cidModelMap = {}, // an hash containing cid/model pairs used for fast model lookup
        _activeModels = {}, // cids of the active models for each facet (a facetName -> [cid] map)
        _vent = _.extend({}, Backbone.Events), // a local event handler used for local events
        _filters = {}, // an hashmap of custom filters
        _sortDir = 'asc', // default sort direction
        _sortAttr,
        _facetsOrder,
        _ownReset = false,

    // inits the models map 
    _initModelsMap  = function() {
        // clear content of _cidModelMap if any
        for(var cid in _cidModelMap) {
            if(_cidModelMap.hasOwnProperty(cid)) {
                delete _cidModelMap[cid];
            }
        }
        
        // generate a clone for each model and add it to the map with the cid as key
        collection.each(function(model) {
            var clone = model.clone();
            clone.cid = model.cid;
            _cidModelMap[model.cid] = clone;
        });
    },
    // deletes the entry for the facet with the given name from the facets hash 
    _removeFacet = function(facetName, silent) {
        delete _facets[facetName];
        delete _activeModels[facetName];
        _resetCollection();

        if(silent !== true) {
          _self.trigger('removeFacet', facetName);
        }
    },
    // fetch (or create if not existing) a facetData object from the facets hash
    _begetFacet = function(facetName, operator) {
        var facetData = _facets[facetName];
        
        if(facetData && facetData.operator === operator) {
            return facetData;
        } else {
            var facet = new Facet(facetName, _cidModelMap, _vent, operator);
            
            // create an entry for the new facet in the facet to active models map 
            _activeModels[facetName] = [];
            
            // add operator property to the object along the actual facet reference
            return {
                facet: facet,
                operator : operator
            };
        }
    },
    _filter = function(facetName, cids) {
        // set active cids for current facet
        _activeModels[facetName] = cids;
        
        // refresh collection according to new facet filters
        _resetCollection();
    },
    _filterBy = function(facetName, facetValue, cids, silent) {
        _filter(facetName, cids);
        
        if(silent !== true){
            // expose filter event
            _self.trigger('filter', facetName, facetValue);
        }
    },
    _unfilterBy = function(facetName, facetValue, cids, silent) {
        _filter(facetName, cids);
        
        if(silent !== true){
            // expose unfilter event
            _self.trigger('unfilter', facetName, facetValue);
        }
    },
    _resetCollection = function() {
        var modelsCids = [], models = [], cid, key, filterName, filterFn;

        // if no values are selected, return all models
        for(cid in _cidModelMap) {
            if(_cidModelMap.hasOwnProperty(cid)) {
                modelsCids.push(cid);
            }
        }

        // otherwise merge the active models of each facet
        for(key in _activeModels) {
            if (_activeModels.hasOwnProperty(key)) {
                if(_facets[key].facet.toJSON().data.selected) {
                    if(_facets[key].operator === 'or') {
                        modelsCids = _.union(modelsCids, _activeModels[key]);
                    } else {
                        modelsCids = _.intersection(modelsCids, _activeModels[key]);
                    }   
                }
            }
        }

        filterFn = function(cid) {
            return filter(_cidModelMap[cid]);
        };

        // filter using the added filter functions
        for(filterName in _filters) {
            if(_filters.hasOwnProperty(filterName)) {
                var filter = _filters[filterName];

                if(filter instanceof Function) {
                    modelsCids = _.filter(modelsCids, filterFn);
                }
            }
        }

        // sort the models by cid
        modelsCids.sort();
        
        // create active models array retrieving clones from the cid to model hash
        for(var i = 0, len = modelsCids.length; i < len; i += 1) {
            models.push(_cidModelMap[modelsCids[i]]);
        }
        
        // notify facets to recompute active facet values count
        _vent.trigger('resetCollection', modelsCids);

        _ownReset = true;

        // reset the collecton with the active models
        collection.reset(models);
        
        _ownReset = false;
    },
    // triggered whenever the Backbone collection is reset
    _resetOrigCollection = function() {
        if(_ownReset) {
            return;
        }

        _initModelsMap();
        // notify facets to recompute 
        _vent.trigger('resetOrigCollection', _cidModelMap);
    },
    // triggered whenever a new Model is added to the Backbone collection
    _addModel = function(model) {
        // create a clone of the model and add it to the cid to model map
        var clone = model.clone();
        clone.cid = model.cid;
        _cidModelMap[model.cid] = clone;
        
        // notify facets about the added model
        _vent.trigger('addModel', model);
    },
    // // triggered whenever a Model instance is removed from the Backbone collection
    _removeModel = function(model) {
        // delete model clone from the cid to model map
        delete _cidModelMap[model.cid];
        
        // notify facets about the removed model
        _vent.trigger('removeModel', model);
        
        var anyActive = _.any(_facets, function(facetData) {
            return facetData.facet.toJSON().data.selected;
        });
        
        if(!anyActive) {
            _resetCollection();
        }
    },
    // triggered whenever a model is changed
    _modifyModel = function(model) {
        // delete old clone from models cache
        delete _cidModelMap[model.cid];
        // store new model clone with the changes in models cache
        var clone = model.clone();
        clone.cid = model.cid;
        _cidModelMap[model.cid] = clone;
        
        // notify facets about the changed model
        _vent.trigger('changeModel', model);
        
        var anyActive = _.any(_facets, function(facetData) {
            return facetData.facet.toJSON().data.selected;
        });
        
        if(!anyActive) {
            _resetCollection();
        }
    },
    _sort = function(silent) {
        collection.comparator = function(m1,m2) {
            var v1 = _getValue(m1, _sortAttr),
                v2 = _getValue(m2, _sortAttr),
                val1,
                val2;
                
            // check if value is a number
            if(isNaN(v1) || isNaN(v2)) { 
                val1 = Date.parse(v1);  // check if value is a date
                val2 = Date.parse(v2);

                if(isNaN(val1) || isNaN(val2)){
                    val1 = v1;  // otherwise is a string
                    val2 = v2;
                }
            } else {
                val1 = parseFloat(v1, 10); 
                val2 = parseFloat(v2, 10);
            }

            if(_sortDir === "asc") {
                if(val1 && val2) {
                    return (val1 > val2) - (val1 < val2);
                } else {
                    if(val1) {
                        return 1;
                    }
                    
                    if(val2) {
                        return -1;
                    }
                }
            } else {
                if(val1 && val2) {
                    return (val1 < val2) - (val1 > val2);
                } else {
                    if(val1) {
                        return -1;
                    }
                    
                    if(val2) {
                        return 1;
                    }
                }
            }
        };
        
        collection.sort();
        
        if(silent !== true) {
            _self.trigger('sort', _sortAttr, _sortDir);
        }
    };

    // creates a Facet or fetches it from the facets map if it was already created before
    // use the given operator if any is given and it is a valid value, use default ('and') otherwise
    this.facet = function(facetName, operator, silent) {
        var op = (operator && (operator === 'and' || operator === 'or')) ? operator : 'and';

        _facets[facetName] = _begetFacet(facetName, op);
        
        if(silent !== true){
            this.trigger('facet', facetName);
        }

        return _facets[facetName].facet;
    };

    // returns a JSON array containing facet JSON objects for each facet added to the collection
    this.toJSON = function() {
        var key, facetData, facetJSON, facetPos, facets = [], sortedFacets = [];
        for (key in _facets) {
            if (_facets.hasOwnProperty(key)) {
                facetData = _facets[key];
                facetJSON = facetData.facet.toJSON();
                // add information about the type of facet ('or' or 'and' Facet)
                facetJSON.data.operator = facetData.operator;
                
                if(_facetsOrder && _facetsOrder instanceof Array) {
                    facetPos = _.indexOf(_facetsOrder, facetJSON.data.name);
                    
                    if(facetPos !== -1) {
                        sortedFacets[facetPos] = facetJSON;
                    } else {
                        facets.push(facetJSON);
                    }
                } else {
                    facets.push(facetJSON);
                }
            }
        }
        
        return sortedFacets.concat(facets);
    };

    // removes all the facets assigned to this collection
    this.clear = function(silent) {
        var key;
        for (key in _facets) {
            if (_facets.hasOwnProperty(key)) {
                _facets[key].facet.remove();
            delete _facets[key];
            }
        }
        
        // resets original values in the collection
        var models = [];
        for (key in _cidModelMap) {
            if (_cidModelMap.hasOwnProperty(key)) {
                models.push(_cidModelMap[key]);
            }
        }
        
        collection.reset(models);
        
        // reset active models
        _activeModels = {};

        if(silent !== true) {
            this.trigger('clear');
        }
        
        return this;
    };
    
    // deselect all the values from all the facets
    this.clearValues = function(silent) {
        var key;

        for (key in _facets) {
            if (_facets.hasOwnProperty(key)) {
                _facets[key].facet.clear();
            }
        }

        // resets original values in the collection
        var models = [];
        for (key in _cidModelMap) {
            if (_cidModelMap.hasOwnProperty(key)) {
                models.push(_cidModelMap[key]);
            }
        }
        
        collection.reset(models);
        
        // reset active models
        _activeModels = {};

        if(silent !== true) {
            this.trigger('clearValues');
        }

        return this;
    };

    // removes the collection from the _collections cache and
    // removes the facetrid property from the collection
    this.remove = function() {
        var facetrid = collection.facetrid;
        this.clear(true);
        
        // detach event listeners from collection instance
        collection.off('reset', _resetOrigCollection);
        collection.off('add', _addModel);
        collection.off('remove', _removeModel);
        collection.off('change', _modifyModel);
    
        delete collection.facetrid;
        delete _collections[facetrid];
    };

    // reorders facets in the JSON output according to the array of facet names given
    this.facetsOrder = function(facetNames, silent) {
        _facetsOrder = facetNames;

        if(silent !== true){
            this.trigger('facetsOrderChange', facetNames);
        }

        return this;
    };

    // sorts the collection by the given attribute
    this.sortBy = function(attrName, silent) {
        _sortAttr = attrName;
        _sort(silent);
        return this;
    };

    // sorts the collection by ascendent sort direction
    this.asc = function(silent) {
        _sortDir = 'asc';
        _sort(silent);
        return this;
    };

    // sorts the collection by descendent sort direction
    this.desc = function(silent) {
        _sortDir = 'desc';
        _sort(silent);
        return this;
    };

    // adds a filter
    this.addFilter = function(filterName, filter, silent) {
        if(filter && filterName) {
            _filters[filterName] = filter;
            _resetCollection(silent);
        }

        return this;
    };

    // removes a filter
    this.removeFilter = function(filterName, silent) {
        if(filterName) {
            delete _filters[filterName];
            _resetCollection(silent);
        }

        return this;
    };

    // removes all the filters
    this.clearFilters = function(silent) {
        for(var filterName in _filters) {
            if(_filters.hasOwnProperty(filterName)) {
                delete _filters[filterName];
            }
        }

        _resetCollection(silent);

        return this;
    };

    // returns a reference to the Backbone.Collection instance
    this.collection = function(){
        return collection;
    };

    // returns the original collection length
    this.origLength = function() {
        return _.size(_cidModelMap);
    };

    // returns the facet list, which can be used for iteration
    this.facets = function(){
        return _.pluck(_facets, 'facet');
    };

    this.initFromSettingsJSON = function(json) {
        var facetCollection, facetr, facets, sort, filter, facetData, attr, 
        eop, iop, fsort, cust, values, facet, i, j, k, len, len2;

        facetr = Backbone.Facetr;
        facetCollection = facetr(collection);
        facets = json.facets;
        sort = json.sort;
        filter = json.search;

        for(i = 0, len = facets.length; i < len; i += 1) {
            facetData = facets[i];
            attr = facetData.attr;
            eop = facetData.eop;
            iop = facetData.iop;
            fsort = facetData.sort;
            cust = facetData.cust;
            values = facetData.vals;

            facet = facetCollection.facet(attr, eop);

            switch(fsort.by){
                case 'count' : {
                    facet.sortByCount();
                } break;
                case 'activeCount' : {
                    facet.sortByActiveCount();
                } break;
                default:{
                    facet.sortByValue();
                }
            }

            facet[fsort.direction]();
            
            if(cust){
                for(k in cust){
                    if(cust.hasOwnProperty(k)){
                        facet.customData(k, cust[k]);
                    }
                }
            }

            for(j = 0, len2 = values.length; j < len2; j += 1) {
                facet.value(values[j], iop);
            }
        }

        if(sort) {
            var sattr = sort.by,
                sdir  = sort.dir;
                
            if(sattr) {
                facetr(collection).sortBy(sattr);
            }

            if(sdir) {
                facetr(collection)[sdir]();
            }
        }

        this.trigger('initFromSettingsJSON');
        
        return this;
    };

    this.settingsJSON = function() {
        var json, facet, facetJSON, values, activeValues;

        json = {};

        if(_sortAttr && _sortDir) {
            json.sort = {
                'by' : _sortAttr,
                'dir' : _sortDir
            };
        }

        if(_.size(_facets) !== 0) {
            json.facets = [];
            
            for(facet in _facets) {
                if(_facets.hasOwnProperty(facet)) {
                    facetJSON= _facets[facet].facet.toJSON();
                    values = _.pluck(facetJSON.values, 'active');
                    activeValues = [];
                    
                    for(var i = 0, len = values.length; i < len; i += 1) {
                        if(values[i]) {
                            activeValues.push(facetJSON.values[i].value);
                        }
                    }

                    json.facets.push({
                        'attr' : facetJSON.data.name,
                        'eop'  : facetJSON.data.extOperator,
                        'iop'  : facetJSON.data.intOperator,
                        'sort' : facetJSON.data.sort,
                        'cust' : facetJSON.data.customData,
                        'vals' : activeValues 
                    });
                }
            }
        }

        return json;
    };

    // init models map
    _initModelsMap();
    
    // remove the facet from the facets hash whenever facet.remove() is invoked
    _vent.on('removeFacet', _removeFacet, this);

    // filter collection whenever facet.value(value) and facet.removeValue(value) are invoked
    _vent.on('value', _filterBy, this);
    _vent.on('removeValue clear', _unfilterBy, this);

    // bind Backbone Collection event listeners to FacetCollection respective actions
    collection.on('reset', _resetOrigCollection);
    collection.on('add', _addModel);
    collection.on('remove', _removeModel);
    collection.on('change', _modifyModel);
};