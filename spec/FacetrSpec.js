describe('Backbone.Facetr', function() {
    // test dataset
    var dataset1 = [ 
        {
            'Name'      : {
                'FirstName' : 'Bob',
                'LastName' : 'Smith'
            },
            'Age'       : 20,
            'Country'   : 'Australia',
            'Hobbies'   : ['fishing','painting','playing the ukulele'],
            'Profession': 'manager'
        },
        {
            'Name'      : {
                'FirstName' : 'Otto',
                'LastName'  : 'Von Braun'
            },
            'Age'       : 35,
            'Country'   : 'New Zealand',
            'Hobbies'   : ['drawing', 'painting'],
            'Profession': 'team manager'
        },
        {
            'Name'      : {
                'FirstName' : 'Sarah',
                'LastName'  : 'Smith'
            },
            'Age'       : 28,
            'Country'   : 'Ireland',
            'Hobbies'   : ['shopping','painting'],
            'Profession': 'project manager'
        },
        {
            'Name'      : {
                'FirstName' : 'Roberta',
                'LastName'  : 'Green'
            },
            'Age'       : 28,
            'Country'   : 'Australia',
            'Hobbies'   : ['shopping'],
            'Profession': 'project manager'
        }
    ],
    dataset2 = [ 
        {
            'Name'      : {
                'FirstName' : 'David',
                'LastName' : 'Smith'
            },
            'Age'       : 48,
            'Country'   : 'Canada',
            'Hobbies'   : ['fishing','playing the ukulele','drawing']
        },
        {
            'Name'      : {
                'FirstName' : 'Jenny',
                'LastName'  : 'McDonald'
            },
            'Age'       : 16,
            'Country'   : 'Scotland',
            'Hobbies'   : ['shopping', 'painting']
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
        
        it('can be given also an id as parameter, to be associated with the collection', function(){
            expect(Facetr(collection, 'mainCollection').collection()).toEqual(collection);
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
                
                it('works also with properties of properties', function() {
                    expect(Facetr(collection).facet('Name.LastName').toJSON().values.length).toEqual(3);
                    expect(Facetr(collection).facet('Name.LastName').toJSON().values[0].value).toBe('Green');
                    expect(Facetr(collection).facet('Name.LastName').toJSON().values[0].count).toEqual(1);
                });

                it('works also with undefined values, 0, booleans and empty arrays', function() {
                    var collection = new Backbone.Collection([
                        {
                            Title : 'title',
                            Domain: undefined,
                            Count: 0,
                            Users: [],
                            Active: false
                        },
                        {
                            Title : 'another title',
                            Domain: 'domain',
                            Count: 5,
                            Users: [],
                            Active: true
                        }
                    ]);

                    var domain = Facetr(collection).facet('Domain');
                    var count = Facetr(collection).facet('Count');
                    var users = Facetr(collection).facet('Users');
                    var active = Facetr(collection).facet('Active');

                    expect(domain.toJSON().values.length).toBe(2);
                    expect(domain.toJSON().values[0].value).toBe('domain');
                    expect(domain.toJSON().values[1].value).toBe('undefined');

                    expect(count.toJSON().values.length).toBe(2);
                    expect(count.toJSON().values[0].value).toBe(0);
                    expect(count.toJSON().values[1].value).toBe(5);
                    
                    expect(users.toJSON().values.length).toBe(1);
                    expect(users.toJSON().values[0].value).toBe('undefined');

                    expect(active.toJSON().values.length).toBe(2);
                    expect(active.toJSON().values[0].value).toBe(false);
                    expect(active.toJSON().values[1].value).toBe(true);
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
                    }).toThrow(new Error('Model property can only be a value (string,number,boolean) or Array of values, not an object'));
                });

                it('triggers a "facet" event, passing the facetName to the event handler, unless true (silent) is passed as last parameter', function(){
                    var facetCollection = Facetr(collection);
                    spyOn(facetCollection, 'trigger');
                    facetCollection.facet('Age');
                    expect(facetCollection.trigger).toHaveBeenCalledWith('facet', 'Age');
                    facetCollection.facet('Age', 'and', true);
                    expect(facetCollection.trigger.calls.length).toEqual(1);
                });

                it('triggers a "filter" event whenever a value is added to a facet, unless true (silent) is passed as last parameter. The event passes the facetName and the value to the event handler', function(){
                    var facetCollection = Facetr(collection);
                    spyOn(facetCollection, 'trigger');
                    facetCollection.facet('Age', 'and', true).value(20);
                    expect(facetCollection.trigger).toHaveBeenCalledWith('filter', 'Age', 20);
                    facetCollection.facet('Age', 'and', true).value(20, 'and', true);
                    expect(facetCollection.trigger.calls.length).toEqual(1);
                });

                it('triggers an "unfilter" event whenever a value is removed from a facet, unless true (silent) is passed as last parameter. The event passes the facetName and the value to the event handler', function(){
                    var facetCollection = Facetr(collection);
                    spyOn(facetCollection, 'trigger');
                    facetCollection.facet('Age', 'and', true).value(20, 'and', true);
                    facetCollection.facet('Age', 'and', true).removeValue(20);
                    expect(facetCollection.trigger).toHaveBeenCalledWith('unfilter', 'Age', 20);
                    facetCollection.facet('Age', 'and', true).removeValue(20, true);
                    expect(facetCollection.trigger.calls.length).toEqual(1);
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

                    describe('has a customData method that', function() {
                        it('can be used to set and get arbitrary data', function() {
                            Facetr(collection).facet('Name.LastName').customData('test', 'some data');

                            expect(Facetr(collection).facet('Name.LastName').customData('test')).toBe('some data');
                        });
                    });

                    describe('has a isSelected method that', function(){
                        it('returns true if any value of the facet is selected, false otherwise', function(){
                            var facet = Facetr(collection).facet('Name.FirstName');

                            facet.value('Bob');
                            
                            expect(facet.isSelected()).toBeTruthy();

                            facet.clear();

                            expect(facet.isSelected()).toBeFalsy();
                        });
                    });

                    describe('has a hierarchy method that', function(){
                        it('generates a hierarchical representation of facet values based on the given hierarchy settings parameter', function(){
                            var hierarchySettings = [
                                {               
                                    value: "manager",
                                    label: "Manager",
                                    groups: [
                                        {
                                            value: "project manager",
                                            label: "Project Manager",
                                            groups: [
                                                {
                                                    value: "team manager",
                                                    label: "Team Manager"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ];

                            var profession = Facetr(collection).facet('Profession').hierarchy(hierarchySettings);

                            var groupedValues = profession.toJSON().groupedValues;

                            expect(groupedValues).toBeDefined();
                            expect(groupedValues instanceof Array).toBeTruthy();
                            expect(groupedValues.length).toBe(1);

                            expect(groupedValues[0].value).toBe('manager');
                            expect(groupedValues[0].label).toBe('Manager');
                            expect(groupedValues[0].count).toBe(4);

                            profession.value('project manager');

                            groupedValues = profession.toJSON().groupedValues;

                            expect(groupedValues[0].activeCount).toBe(3);
                            expect(groupedValues[0].groups[0].activeCount).toBe(3);
                            expect(groupedValues[0].groups[0].groups[0].activeCount).toBe(1);

                            profession.removeValue('project manager');

                            expect(groupedValues[0].activeCount).toBe(4);
                            expect(groupedValues[0].groups[0].activeCount).toBe(3);
                            expect(groupedValues[0].groups[0].groups[0].activeCount).toBe(1);
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

                it('triggers a "clear" event, unless true (silent) is passed as last parameter', function(){
                    var facetCollection = Facetr(collection);
                    spyOn(facetCollection, 'trigger');
                    facetCollection.clear();
                    expect(facetCollection.trigger).toHaveBeenCalledWith('clear');
                    facetCollection.clear(true);
                    expect(facetCollection.trigger.calls.length).toEqual(1);
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
            
            // FacetCollection facets
            describe('has a facets method', function(){
                it('that returns the list of Facet instances created for this FacetCollection', function(){
                    var fc = Facetr(collection);
                    fc.facet('Age');
                    fc.facet('Name.FirstName');

                    expect(fc.facets().length).toEqual(2);
                    expect(fc.facets()[0].toJSON().data.name).toEqual('Age');
                    expect(fc.facets()[1].toJSON().data.name).toEqual('Name.FirstName');
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
                        'Name'      : {
                            'FirstName' : 'Ron',
                            'LastName'  : 'McDonald'
                        },
                        //'Age'         : 45, // remove a property to check for this case
                        'Country'   : 'Wales',
                        'Hobbies'   : ['fishing', 'hunting'],
                        'Residence': 'Liverpool' // add a property to check for this case
                    });
                    
                    Facetr(collection).facet('Residence');

                    var toJSON = Facetr(collection).toJSON();

                    expect(toJSON[1].values.length).toBe(4); // check that Age values are 4 (3 + the 'undefined' of the last added model)
                    expect(toJSON[2].values.length).toBe(2); // check that Residence has 2 values (the one of the last added model + 'undefined' with cound 4 from the previous models)
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

            describe('keeps model ids untouched', function() {
                it('by deep cloning the models in the collection upon initialization', function() {
                    var collection = new Backbone.Collection([
                        {
                            id : '123',
                            Name : 'John'   
                        },
                        {
                            id : '456',
                            Name : 'Bob'    
                        },
                    ]);

                    Facetr(collection).facet('Name').value('Bob');

                    expect(collection.at(0).id).toBe('456');

                    Facetr(collection).clearValues();

                    expect(collection.at(0).id).toBe('123');
                    expect(collection.at(1).id).toBe('456');        
                });
            });

            describe('has a sortBy method that', function() {
                var collection = new Backbone.Collection([
                    {
                        id : '123',
                        Name : 'John',
                        Age : 25,
                        DateOfBirth : '1988-04-03 10:00:08' 
                    },
                    {
                        id : '456',
                        Name : 'Bob',
                        Age : 34,
                        DateOfBirth : '1979-02-24 19:43:20' 
                    },
                ]);

                Facetr(collection).sortBy('Name').asc();

                it('sorts the collection according to the given attribute and direction', function() {
                    expect(collection.at(0).get('Name')).toBe('Bob');
                    expect(collection.at(1).get('Name')).toBe('John');
                });

                it('works also with numeric values', function() {
                    Facetr(collection).sortBy('Age').asc();
                    expect(collection.at(0).get('Age')).toBe(25);
                    expect(collection.at(1).get('Age')).toBe(34);
                });

                it('works also with date values', function() {
                    Facetr(collection).sortBy('DateOfBirth').asc();
                    expect(collection.at(0).get('DateOfBirth')).toBe('1979-02-24 19:43:20');
                    expect(collection.at(1).get('DateOfBirth')).toBe('1988-04-03 10:00:08');
                }); 

                it('triggers a "sort" event, passing the sortAttr and sortDir to the event handler', function(){
                    var facetCollection = Facetr(collection);
                    spyOn(facetCollection, 'trigger');
                    facetCollection.sortBy('Name');
                    expect(facetCollection.trigger).toHaveBeenCalledWith('sort', 'Name', 'asc');
                    facetCollection.sortBy('Name', true);
                    expect(facetCollection.trigger.calls.length).toEqual(1);
                });
            });

            describe('has methods to add and remove custom filters to/from the collection', function() {
                var collection = new Backbone.Collection([
                    {
                        id : '123',
                        Name : 'John',
                        Age : 25,
                        DateOfBirth : '1988-04-03 10:00:08' 
                    },
                    {
                        id : '456',
                        Name : 'Bob',
                        Age : 34,
                        DateOfBirth : '1979-02-24 19:43:20' 
                    },
                ]);

                it('the addFilter method adds a filter function and filters the collection accordingly ', function() {
                    var fc = Facetr(collection);

                    fc.addFilter('exampleFilter', function(model) {
                        return model.get('Age') > 30;
                    });

                    expect(collection.length).toBe(1);
                    expect(collection.at(0).get('Age')).toBe(34);
                });

                it('the removeFilter method removes a filter function and unfilters the collection accordingly ', function() {
                    var fc = Facetr(collection);

                    fc.removeFilter('exampleFilter');

                    expect(collection.length).toBe(2);
                });

                it('the clearFitlers method removes all the filters and unfilters the collection accordingly', function() {
                    var fc = Facetr(collection);

                    fc.addFilter('exampleFilter', function(model) {
                        return model.get('Age') > 30;
                    });

                    expect(collection.length).toBe(1);

                    fc.addFilter('exampleFilter2', function(model) {
                        return model.get('Age') < 18;
                    });

                    expect(collection.length).toBe(0);

                    fc.clearFilters();

                    expect(collection.length).toBe(2);
                });
            });
        });
    });
});
