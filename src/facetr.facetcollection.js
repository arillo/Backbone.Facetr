// FacetCollection class 
var	FacetCollection = function(collection) {
	// give FacetCollection instances ability to handle Backbone Events
	_.extend(this, Backbone.Events);
	
	// init local variables
	var _self						= this,
		_facets 					= {},								// facets list
		_cidModelMap				= {},	 							// an hash containing cid/model pairs used for fast model lookup
		_activeModels				= {},								// cids of the active models for each facet (a facetName -> [cid] map)
		_vent						= _.extend({}, Backbone.Events),	// a local event handler used for local events
		_sortDir					= 'asc',
		_sortAttr,
		_filterRegex, 
		_filterAttr,
		_facetsOrder,
	

	// inits the models map	
	_initModelsMap	= function() {
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
	_removeFacet = function(facetName) {
		delete _facets[facetName];
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
	_filterBy = function(facetName, facetValue, cids) {
		_filter(facetName, cids);
		
		// expose filter event
		this.trigger('filter', facetName, facetValue);
	},
	_unfilterBy = function(facetName, facetValue, cids) {
		_filter(facetName, cids);
		
		// expose unfilter event
		this.trigger('unfilter', facetName, facetValue);
	},
	_resetCollection = function(silent) {
		var modelsCids = [], models = [];
		
		// if no values are selected, return all models
		for(var cid in _cidModelMap) {
			if(_cidModelMap.hasOwnProperty(cid)) {
				modelsCids.push(cid);
			}
		}
		
		// otherwise merge the active models of each facet
		for (var key in _activeModels) {
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
		
		// filterBy
		if(_filterRegex && _filterAttr) {
			modelsCids = _.filter(modelsCids, function(cid) {
				var value = _getValue(_cidModelMap[cid], _filterAttr);
				return _filterRegex.test(value);					
			});
		}
					
		// sort the models by cid
		modelsCids.sort();
		
		// create active models array retrieving clones from the cid to model hash
		for(var i = 0, len = modelsCids.length; i < len; i += 1) {
			models.push(_cidModelMap[modelsCids[i]]);
		}
		
		// reset the collecton with the active models
		collection.reset(models, { silent : true });
		
		// notify facets to recompute active facet values count
		_vent.trigger('resetCollection', modelsCids);

		if(!silent) {
			_self.trigger('reset', models);			
		}
	},
	// triggered whenever the Backbone collection is reset
	_resetOrigCollection = function() {
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
		
		// expose add event
		_self.trigger('add', model);
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
			
		// expose remove event
		_self.trigger('remove', model);
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
		
		// expose change event
		_self.trigger('change', model);
	},
	_sort = function(silent) {
		collection.comparator = function(m1,m2) {
			var v1 = _getValue(m1, _sortAttr),
				v2 = _getValue(m2, _sortAttr),
				val1,
				val2;
				
			val1 = parseInt(v1, 10); // check if value is a number
			val2 = parseInt(v2, 10);
			
			if(isNaN(val1) || isNaN(val2)){
				val1 = v1;
				val2 = v2;
			}

			val1 = Date.parse(v1);	// check if value is a date
			val2 = Date.parse(v2);

			if(isNaN(val1) || isNaN(val2)){
				val1 = v1;
				val2 = v2;
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
		
		if(!silent) {
			_self.trigger('sort', _sortAttr, _sortDir);
		}
	};

	// creates a Facet or fetches it from the facets map if it was already created before
	// use the given operator if any is given and it is a valid value, use default ('and') otherwise
	this.facet = function(facetName, operator) {
		var op = (operator && (operator === 'and' || operator === 'or')) ? operator : 'and';

		_facets[facetName] = _begetFacet(facetName, op);
			
		this.trigger('facet', facetName);
			
		return _facets[facetName].facet;
	};
			
	// returns a JSON array containing facet JSON objects for each facet added to the collection
	this.toJSON = function() {
		var key, facet, facetData, facetJSON, facetPos, facets = [], sortedFacets = [];
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
		
		collection.reset(models, { silent: true });
		//collection.reset(models);
		
		if(!silent) {
			this.trigger('clear', models);
		}
		
		// reset active models
		_activeModels = {};
		
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
		
		collection.reset(models, { silent: true });
		
		if(!silent) {
			this.trigger('clearValues', models);
		}

		// reset active models
		_activeModels = {};

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
	this.facetsOrder = function(facetNames) {
		_facetsOrder = facetNames;
		this.trigger('facetsOrderChange', facetNames);
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
	
	// filters the collection by applying regex.test to each value in the model for the given attribute
	this.filterBy = function(attr, keywords, silent) {
		if(keywords) {
			_filterRegex = new RegExp(keywords, 'i');
		} else {
			_filterRegex = undefined;
		}
		_filterAttr = attr;
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
	
	this.initFromSettingsJSON = function(json) {
		var Facetr	   = Backbone.Facetr,
			facets     = json.facets,
			sort       = json.sort,
			filter     = json.search;
			
		for(var i = 0, len = facets.length; i < len; i += 1) {
			
			var f 		= facets[i],
				attr 	= f.attr,
				eop     = f.eop,
				iop     = f.iop,
				values 	= f.vals,
				facet;
			
			facet = Facetr(collection).facet(attr, eop);

			if(facet) {
				for(var j = 0, len2 = values.length; j < len2; j += 1) {
					facet.value(values[j], iop);
				}
			}
		}
		
		if(sort) {
			var sattr = sort.by,
				sdir  = sort.dir;
				
			if(sattr) {
				Facetr(collection).sortBy(sattr, true);
			}
			
			if(sdir) {
				Facetr(collection)[sdir](true);
			}
		}
		
		if(filter) {
			var fattr  = filter.attr,
				fregex = filter.regex;
				
			if(fattr && fregex) {
				Facetr(collection).filterBy(fattr, fregex, true);
			}
		}
		
		this.trigger('reset');
		
		return this;
	};
	
	this.settingsJSON = function() {
		var json = {};
		
		if(_sortAttr && _sortDir) {
			json.sort = {
				'by' : _sortAttr,
				'dir' : _sortDir
			};
		}
		
		if(_filterAttr && _filterRegex) {
			json.search = {
				'attr' : _filterAttr,
				'regex' : _filterRegex.toString().replace('/i','').replace('/','')
			};
		}
		
		if(_.size(_facets) !== 0) {
			json.facets = [];
			
			for(var facet in _facets) {
				if(_facets.hasOwnProperty(facet)) {
					var facetJSON= _facets[facet].facet.toJSON(), 
					    operator = _facets[facet].operator, 
					    values = _.pluck(facetJSON.values, 'active'), 
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
	
	// bind Backbone Collection event listeners	to FacetCollection respective actions
	collection.on('reset', _resetOrigCollection);
	collection.on('add', _addModel);
	collection.on('remove', _removeModel);
	collection.on('change', _modifyModel);
};