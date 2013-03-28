describe('Backbone.Facetr', function() {
	// test dataset
	var dataset1 = [ 
		{
			'Name' 		: {
				'FirstName' : 'Bob',
				'LastName' : 'Smith'
			},
			'Age'  		: 20,
			'Country' 	: 'Australia',
			'Hobbies'	: ['fishing','painting','playing the ukulele']
		},
		{
			'Name' 		: {
				'FirstName' : 'Otto',
				'LastName' 	: 'Von Braun'
			},
			'Age'  		: 35,
			'Country' 	: 'New Zealand',
			'Hobbies'	: ['drawing', 'painting']
		},
		{
			'Name' 		: {
				'FirstName' : 'Sarah',
				'LastName'	: 'Smith'
			},
			'Age'  		: 28,
			'Country' 	: 'Ireland',
			'Hobbies'	: ['shopping','painting']
		},
		{
			'Name' 		: {
				'FirstName' : 'Roberta',
				'LastName'	: 'Green'
			},
			'Age'  		: 28,
			'Country' 	: 'Australia',
			'Hobbies'	: ['shopping']
		}
	],
	dataset2 = [ 
		{
			'Name' 		: {
				'FirstName' : 'David',
				'LastName' : 'Smith'
			},
			'Age'  		: 48,
			'Country' 	: 'Canada',
			'Hobbies'	: ['fishing','playing the ukulele','drawing']
		},
		{
			'Name' 		: {
				'FirstName' : 'Jenny',
				'LastName'	: 'McDonald'
			},
			'Age'  		: 16,
			'Country' 	: 'Scotland',
			'Hobbies'	: ['shopping', 'painting']
		}
	],
	// test collection
	collection = new Backbone.Collection(dataset1);
	
	beforeEach(function() {
		// reload dataset in the collection
		collection.reset(dataset1);
			
		// clear facets after each test
		Facetr(collection).clear();
	});
			
	// Facetr		
	describe('is a function that given a Backbone.Collection as argument', function() {
		it('creates a FacetCollection and stores it in Facetr internal hash', function() {
			// as FacetCollection instances have a method called 'facet', we check its existance on the returned
			// object to be sure it is an instance of FacetCollection
			// this is the only way to test this as FacetCollection function is hidden by closure in Facetr code
			expect(Facetr(collection).facet).toBeDefined();
		});
		
		it('sets the facetrid property on the collection', function() {			
			expect(collection.facetrid).toBeDefined();
		});
		
		// FacetCollection
		describe('returns a FacetCollection that', function() {
			
			
			
			// FacetCollection facet
			describe('has a facet method that', function() {
				it('creates a new facet given a facet name and returns it for chaining', function() {
					expect(Facetr(collection).facet('Country').toJSON().data.name).toBe('Country');
				});
				
				it('sends an event to the facet to compute the value/count instances from the collection models', function() {
					expect(Facetr(collection).facet('Country').toJSON().values.length).toEqual(3);
					expect(Facetr(collection).facet('Country').toJSON().values[0].value).toBe('Australia');
					expect(Facetr(collection).facet('Country').toJSON().values[0].count).toEqual(2);
				});
				
				it('works also with deep properties (ie. properties of properties)', function() {
					expect(Facetr(collection).facet('Name.LastName').toJSON().values.length).toEqual(3);
					expect(Facetr(collection).facet('Name.LastName').toJSON().values[0].value).toBe('Green');
					expect(Facetr(collection).facet('Name.LastName').toJSON().values[0].count).toEqual(1);
				});
				
				it('works also with array properties', function() {
					expect(Facetr(collection).facet('Hobbies').toJSON().values.length).toEqual(5);
					expect(Facetr(collection).facet('Hobbies').toJSON().values[0].value).toBe('drawing');
					expect(Facetr(collection).facet('Hobbies').toJSON().values[0].count).toBe(1);
				});
				
				//it('throws an error if the property is an object or undefined', function() {
				it('throws an error if the property is an object', function() {
					expect(function() { 
						Facetr(collection).facet('Name'); 
					}).toThrow(new Error('Model property can only be a value (string,number) or Array of values, not an object'));
					// expect(function() {
						// Facetr(collection).facet('UnexistingProperty');
					// }).toThrow(new Error('Facetr cannot add a facet using a non-existent model property'));
				});
				
				// Facet
				describe('returns a Facet that', function() {
					// Facet toJSON
					describe('has a toJSON method that', function() {
						it('returns a JSON object with the data and the values of the facet', function() {
							expect(Facetr(collection).facet('Name.LastName').toJSON().data).toBeDefined();
							expect(Facetr(collection).facet('Name.LastName').toJSON().values.length).toEqual(3);
						});
					});
					
					// Facet label
					describe('has a label method that', function() {
						it('sets the facet label to a given value', function() {
							expect(Facetr(collection).facet('Name.LastName').label('Surname').toJSON().data.label).toBe('Surname');
						});
					});
					
					// Facet desc
					describe('has a desc method that', function() {
						it('sorts the facet values in descendent order', function() {
							expect(Facetr(collection).facet('Country').desc().toJSON().data.sort.direction).toBe('desc');
							expect(Facetr(collection).facet('Country').toJSON().values[0].value).toBe('New Zealand');
							expect(Facetr(collection).facet('Country').toJSON().values[1].value).toBe('Ireland');
							expect(Facetr(collection).facet('Country').toJSON().values[2].value).toBe('Australia');
						});
					});

					// Facet asc
					describe('has a asc method that', function() {
						it('sorts the facet values in ascendent order', function() {
							expect(Facetr(collection).facet('Country').asc().toJSON().data.sort.direction).toBe('asc');
							expect(Facetr(collection).facet('Country').toJSON().values[0].value).toBe('Australia');
							expect(Facetr(collection).facet('Country').toJSON().values[1].value).toBe('Ireland');
							expect(Facetr(collection).facet('Country').toJSON().values[2].value).toBe('New Zealand');
						});	
					});
					
					// Facet sortByCount
					describe('has a sortByCount method that', function() {
						it('sorts the facet values by count', function() {
							expect(Facetr(collection).facet('Country').sortByCount().toJSON().data.sort.by).toBe('count');
							// note that by default sort direction is asc
							expect(Facetr(collection).facet('Country').toJSON().values[0].count).toEqual(1);
							expect(Facetr(collection).facet('Country').toJSON().values[1].count).toEqual(1);
							expect(Facetr(collection).facet('Country').toJSON().values[2].count).toEqual(2);
						});
					});

					// Facet sortByValue
					describe('has a sortByValue method that', function() {
						it('sorts the facet values by value', function() {
							expect(Facetr(collection).facet('Country').sortByValue().toJSON().data.sort.by).toBe('value');
							expect(Facetr(collection).facet('Country').toJSON().values[0].value).toBe('Australia');
							expect(Facetr(collection).facet('Country').toJSON().values[1].value).toBe('Ireland');
							expect(Facetr(collection).facet('Country').toJSON().values[2].value).toBe('New Zealand');
						});
					});
					
					// Facet remove
					describe('has a remove method that', function() {
						it('removes a facet from the collection and defilters the collection accordingly', function() {
							expect(Facetr(collection).facet('Country')).toBeDefined();
							expect(Facetr(collection).toJSON().length).toEqual(1);
							expect(Facetr(collection).facet('Country').remove()).toBeUndefined();
							expect(Facetr(collection).toJSON().length).toEqual(0);
							expect(collection.length).toEqual(4);
						});
					});
					
					// Facet value method
					describe('has a value method that', function() {
						it('adds a facet filter using the given value, filtering the collection accordingly', function() {
							Facetr(collection).facet('Country').value('Australia');
							expect(collection.length).toEqual(2);
							expect(collection.at(0).get('Country')).toBe('Australia')
						});
						
						describe('returns a FacetExp that', function() {
							describe('has an and method that', function() {
								it('can be used for "and" chaining of facet values', function() {
									Facetr(collection).facet('Hobbies').value('fishing').and('painting');
									expect(collection.length).toEqual(1);
									expect(_.indexOf(collection.at(0).get('Hobbies'), 'fishing')).not.toEqual(-1);
									expect(_.indexOf(collection.at(0).get('Hobbies'), 'painting')).not.toEqual(-1);
								});
							});
							
							describe('has an or method that', function() {
								it('can be used for "or" chaining of facet values', function() {
									Facetr(collection).facet('Country').value('Ireland').or('Australia');
									expect(collection.length).toEqual(3);
									expect(_.indexOf(collection.pluck('Country'), 'Ireland')).not.toEqual(-1);
									expect(_.indexOf(collection.pluck('Country'), 'Australia')).not.toEqual(-1);
								});
							});
						});	
					});
					
					// Facet removeValue method
					describe('has a removeValue method that', function() {
						it('removes a facet value and defilters the collection accordingly', function() {
							Facetr(collection).facet('Name.LastName').value('Smith');
							expect(collection.length).toEqual(2);
							Facetr(collection).facet('Name.LastName').removeValue('Smith');
							expect(collection.length).toEqual(4);
						});
					});
				});
			});
			
			// FacetCollection toJSON
			describe('has a toJSON method that', function() {
				it('returns a JSON array containing a facet JSON object for each facet added to the collection', function() {
					Facetr(collection).facet('Country');
					Facetr(collection).facet('Age');
					expect(Facetr(collection).toJSON().length).toEqual(2);
				});
			});
			
			// FacetCollection clear
			describe('has a clear method', function() {
				it('that removes all the facets assigned to the collection', function() {
					expect(Facetr(collection).clear().toJSON().length).toEqual(0);
				});
			});
			
			// FacetCollection remove
			describe('has a remove method', function() {
				it('that removes the collection from Facetr cache', function() {
					expect(Facetr(collection).remove()).toBeUndefined();
				});
				it('that removes the facetrid property from the collection', function() {
					Facetr(collection).remove();
					expect(collection.facetrid).toBeUndefined();
				});
			});
			
			// FacetCollection update on reset
			describe('updates itself on each Backbone Collection reset', function() {
				it('by reapplying all facets to the new Model instances', function() {
					Facetr(collection).facet('Name.LastName').value('Smith');
					
					expect(collection.length).toEqual(2);
					
					collection.forEach(function(model) {
						expect(model.get('Name').LastName).toBe('Smith');
					});
					
					collection.reset(dataset2);
					
					expect(collection.length).toEqual(1);
					
					collection.forEach(function(model) {
						expect(model.get('Name').LastName).toBe('Smith');
					});
				});
			});
			
			// update on add
			describe('updates itself whenever a new Model is added to the collection', function() {
				it('by recomputing facet values according to the new model properties', function() {
					Facetr(collection).facet('Country');
					Facetr(collection).facet('Age');
					
					collection.add({
						'Name' 		: {
							'FirstName' : 'Ron',
							'LastName'	: 'McDonald'
						},
						//'Age'  		: 45, // remove a property to check for this case
						'Country' 	: 'Wales',
						'Hobbies'	: ['fishing', 'hunting'],
						'Profession': 'blacksmith' // add a property to check for this case
					});
					
					Facetr(collection).facet('Profession');

					var toJSON = Facetr(collection).toJSON();
					
					expect(toJSON[1].values.length).toBe(3); // check that Age values are still only 3
					expect(toJSON[2].values.length).toBe(1); // check that Profession has only 1 value
				});
			});
			
			// update on remove
			describe('updates itself whenever a Model instance is removed from the collection', function() {
				it('by recomputing facet values according to the removed model properties', function() {
					Facetr(collection).facet('Country');
					Facetr(collection).sortBy('Country').asc();
					
					// remove one model with Country value equal 'Australia'
					// note that there are 2 models in the dataset with Country equal Australia
					collection.remove(collection.at(0));
					
					expect(Facetr(collection).toJSON()[0].values[0].count).toBe(1); // check that Australia count has changed accordingly
				
					collection.remove(collection.at(0)); // remove also other instance having Country value 'Australia'

					// check that value Australia has been removed completely, as there are no more models having Country equal 'Australia'
					expect(Facetr(collection).toJSON()[0].values.length).toBe(2);
					expect(Facetr(collection).toJSON()[0].values[0].value).toBe('Ireland');
				});
			});
			
			// update on change
			describe('updates itself whenever an attribute of a Model instance in the collection is changed', function() {
				it('by recomputing facet values according to the property changes', function() {
					Facetr(collection).facet('Country');
					Facetr(collection).sortBy('Country').asc();
					
					// change first model Country value from 'Australia' to 'Ireland'
					collection.at(0).set({Country:'Ireland'});
					
					// check that 'Australia' count gets decreased and 'Ireland' count increased accordingly
					expect(Facetr(collection).toJSON()[0].values[0].count).toBe(1);
					expect(Facetr(collection).toJSON()[0].values[1].count).toBe(2);
					
					collection.at(0).set({Country: 'Wales'});
					
					// check that 'Ireland' count gets decreased and that new value 'Wales' with count 1 is properly added
					expect(Facetr(collection).toJSON()[0].values[1].count).toBe(1);
					expect(Facetr(collection).toJSON()[0].values[2].count).toBe(1);
				});
			});
		});
	});
});
