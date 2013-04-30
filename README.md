
# Backbone.Facetr

VERSION 0.2.3

### <a name="contents"></a> CONTENTS

* [INTRODUCTION](#introduction)
* [INSTALLATION](#installation)
* [BASIC USAGE](#basic-usage)
* [DOT NOTATION](#dot-notation)
* [API REFERENCE](#api-reference)
* [EXAMPLES](#examples)
* [LICENSE](#license)

### <a name="introduction"></a> INTRODUCTION

Backbone.Facetr is a plugin which enables filtering of Backbone collections through facets, using an elegant API and with fast performance time.

It works flawlessly up to 2500 items; computation starts getting slower with 5000 - 10000 items. This is however an 
early version; optimizations may improve performance in future realeases.

If you decide to use Facetr in one of your projects, contact us at &#102;&#097;&#099;&#101;&#116;&#114;&#064;&#097;&#114;&#105;&#108;&#108;&#111;&#046;&#110;&#101;&#116;, we would be glad to add the link to your project in the [examples](#examples) section.


### <a name="installation"></a> INSTALLATION

	<!DOCTYPE html>
	<html>
		....

		<!-- include Backbone.Facetr dependencies -->
		<script src="js/lib/underscore.js"></script>
		<script src="js/lib/backbone.js"></script>

		<!-- include Backbone.Facetr code -->
		<script src="js/code/backbone.facetr.js"></script>
		<!-- include your js code -->
	        <script> ..... </script>
		</body>
	</html>

#### node.js

	npm install backbone.facetr

	// then in your code
	var Facetr = require('backbone.facetr');

### <a name="basic-usage"></a> BASIC USAGE

	// create a collection with few test items
	var collection = new Backbone.Collection([
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
			'Hobbies'	: ['drawing', 'painting', 'shopping']
		},
		{
			'Name' 		: {
				'FirstName' : 'Sarah',
				'LastName'	: 'Smith'
			},
			'Age'  		: 28,
			'Country' 	: 'Ireland',
			'Hobbies'	: ['shopping','painting']
		}
	]);

	Facetr(collection).facet('Name.LastName').value('Smith'); // collection contains 'Sarah Smith' and 'Bob Smith'
	Facetr(collection).facet('Hobbies').value('shopping'); // contains only 'Sarah Smith' 
	Facetr(collection).facet('Name.LastName').removeValue('Smith'); // contains 'Sarah Smith' and 'Otto Von Braun'

	// removes all facet values and restores original collection content
	Facetr(collection).clearValues() 

	// if chaining is not your cup of tea, the following is equivalent to the above code
	var facetCollection = Facetr(collection); // returns a FacetCollection object
	var lastNameFacet = facetCollection.facet('Name.LastName'); // returns a Facet object
	var hobbiesFacet = facetCollection.facet('Hobbies');

	lastNameFacet.value('Smith');	// returns a FacetExp object
	hobbiesFacet.value('shopping');
	lastNameFacet.removeValue('Smith');

	// read the API Reference section for more
	// most examples will use the above collection reference to illustrate functionalities


### <a name="dot-notation"></a> DOT NOTATION

	Syntax: PropertyName{1}(.PropertyName)*

In the context of Facetr, Dot Notation refers to the syntax used to define facets on a collection. Using the 
Facetr Dot Notation it is possible to define facets on properties of a Model, as well as on properties of its properties.

For example, consider the following model:

	var model = new Backbone.Model({
		'Name' : {
			'FirstName' : 'John',
			'LastName' : ['Smith','White']
		},
		'City' : 'London',
		'Age' : 45,
		'FamilyMembers' : [
            { 'Name' : 'Robert' },
            { 'Name' : 'Margaret' }
        ]
	});

To add a facet on property 'FirstName' the following expression in Dot Notation syntax can be used: 'Name.FirstName'.


	Facetr(collection).facet('Name.FirstName');


Theoretically there is no depth limit for a Dot Notation expression (e.g. PropertyName1.PropertyName2...PropertyNameN), the only 
limitation being the common sense.

A facet can only be added on a Backbone Model or object property having any of the following value types:
 
* string | number | boolean
* Array of strings
* Array of numbers
* Array of booleans
* Array of objects
* Array of Backbone models

It cannot be added on properties having the following value / composite types:

* object
* Backbone Collection
* Array of arrays
* Array of Backbone collections

.. and in any other case not mentioned in the list of allowed value types


#### EXAMPLE

	Facetr(collection).facet('City');          		// valid, City is a string
	Facetr(collection).facet('Age');  	        	// valid, Age is a Number
	Facetr(collection).facet('Name.LastName');      // valid, LastName is an Array of strings
	Facetr(collection).facet('FamilyMembers.Name'); // valid, takes value of Name of each object in array FamilyMembers
	Facetr(collection).facet('Name'); 	        	// error, Name is an object

	// etc..


### <a name="api-reference"></a> API Reference

* [Facetr](#facetr)

* [FacetCollection](#facetcollection)
    * [facet](#facetcollection-facet)
    * [toJSON](#facetcollection-tojson)
    * [clear](#facetcollection-clear)
    * [remove](#facetcollection-remove)
    * [sortBy](#facetcollection-sortby)
    * [asc](#facetcollection-asc)
    * [desc](#facetcollection-desc)
    * [addFilter](#facetcollection-addfilter)
    * [removeFilter](#facetcollection-removefilter)
    * [clearFilters](#facetcollection-clearfilters)
    * [clearValues](#facetcollection-clearvalues)
    * [facetsOrder](#facetcollection-facetsorder)
    * [collection](#facetcollection-collection)
    * [origLength](#facetcollection-origlength)
    * [settingsJSON](#facetcollection-settingsjson)
    * [initFromSettingsJSON](#facetcollection-initfromsettingsjson)

* [Facet](#facet)
	* [value](#facet-value)
	* [removeValue](#facet-removevalue)
	* [toJSON](#facet-tojson)
	* [label](#facet-label)
	* [sortByCount](#facet-sortbycount)
	* [sortByActiveCount](#facet-sortbyactivecount)
	* [sortByValue](#facet-sortbyvalue)
	* [asc](#facet-asc)
	* [desc](#facet-desc)
	* [remove](#facet-remove)
	* [clear](#facet-clear)
	* [customData](#facet-customdata)
	* [isSelected](#facet-isselected)

* [FacetExp](#facetexp)
	* [and](#facetexp-and)
	* [or](#facetexp-or)


### <a name="facetr"></a> Facetr
	
##### Facetr(collection:Backbone.Collection, [id:string]) : FacetCollection                     
	
Initialize a Collection to be used with Facetr. The first building block of
any Facetr expression. Returns the created FacetCollection instance for
method chaining. An id can be associated with the collection.
	
example                                                                      
                                                                              
	Facetr(collection);

	// or also
	Facetr(collection, 'myCollection');
	
	// which enables the following syntax
	Facetr('myCollection') === Facetr(collection); // true                                                      
	

### <a name="facetcollection"></a> FacetCollection


##### <a name="facetcollection-facet"></a> facet(dotNotationExpr:string, [operator:string]) : Facet

Adds a Facet on the given collection using the property refered to by the
Dot Notation expression (see [Dot Notation section](#dot-notation) for more details).
Valid operator values are: 'or' and 'and' (anything else will default to 'and').
Returns the created Facet instance to allow method chaining.
Triggers a facet event with the facetName passed to the callback.

example

	Facetr(collection).on('facet', function(facetName) {
		console.log(facetName);
	});

	// add facet on property 'Age' using default operator ('and')
	Facetr(collection).facet('Age');

	// add facet on property 'LastName' of object 'Name' using 'or' operator
	Facetr(collection).facet('Name.LastName', 'or');

	// console output would be
	// Age
	// Name.LastName


##### <a name="facetcollection-tojson"></a> toJSON() : Array

Returns an array containing objects representing the status of the facets
added to the collection. Useful for rendering out facets lists.
Each object in the array is the result of invoking toJSON on each Facet
(see Facet documentation below for the Facet.toJSON method).

example

	// create a collection with two models
	var collection = new Backbone.Collection([
	    {
	        'Name'      : {
	            'FirstName' : 'Bob',
	            'LastName' : 'Smith'
	        },
	        'Age'       : 20
	    },
		{
			'Name' 		: {
				'FirstName' : 'Otto',
				'LastName' 	: 'Von Braun'
			},
			'Age'  		: 35
		}
	]);

	Facetr(collection).facet('Name.FirstName').label('First Name');
	Facetr(collection).facet('Name.FirstName').value('Bob');

	var json = Facetr(collection).toJSON();

	// value of json will be an array of Facet data object with the following format:
	//
	// [
	//		{
	//			data : {
	//				extOperator : 'and',
	//				intOperator : 'or',
	//				label       : 'First Name',
	//				name        : 'Name.FirstName',
	//				selected    : true,
	//				sort		: {
	//					by 		  : 'value',
	//					direction : 'asc'
	//				}
	//				customData : {}
	//			},
	//			values : [
	//				{
	//					active 		: true,
	//					activeCount : 1,
	//					count		: 1,
	//					value		: 'Bob'
	//				},
	//				{
	//					active 		: false,
	//					activeCount : 0,
	//					count		: 1,
	//					value		: 'Otto'
	//				}
	//			]
	//		}
	// ]


##### <a name="facetcollection-clear"></a> clear([silent:boolean]) : FacetCollection

Removes all the facets added to the collection and unfilters it accordingly.
Use this method to reset the original models in the collection.
Triggers a clear event, unless true is passed as parameter.

example

	Facet(collection).on('clear', function() {
		console.log('All facets were removed');
	});

	Facet(collection).clear();

	// console output
	All facets were removed


##### <a name="facetcollection-remove"></a> remove() : undefined

Removes all the facets and the facetrid added on the collection id upon
Facetr(collection) initialization. Resets the original items in the
collection.

example

	Facetr(collection).remove()


##### <a name="facetcollection-sortby"></a> sortBy(attribute:string, [silent]) : FacetCollection

Sorts the collection according to the given attribute name. By default
ascendent sort is used. See asc() and desc() methods below to define sort
direction. Triggers sort event unless true is passed as parameter.
This method automatically recognizes string, numeric or date values.

example

	Facetr(collection).on('sort', function(attr, dir) {
		console.log('Sorting by ' + attr + ' ' + dir);
	});

	Facetr(collection).sortBy('Age');

	// console output
	Sorting by Age asc


##### <a name="facetcollection-asc"></a> asc([silent:boolean]) : FacetCollection

Sorts the collection in ascendent order by the attribute selected using
sortBy method.
If sortBy was not invoked before, this method has no effect. Triggers sort
event unless true is passed as parameter.

example

	Facetr(collection).sortBy('Age').asc();


##### <a name="facetcollection-desc"></a> desc([silent:boolean]) : FacetCollection

Sorts the collection in descendent order by the attribute selected using
sortBy method.
If sortBy was not invoked before, this method has no effect. Triggers sort
event unless true is passed as parameter.

example

	Facetr(collection).sortBy('Age').desc();


##### <a name="facetcollection-addfilter"></a> addFilter(filterName:string, filter:function, [silent:boolean]) : FacetCollection

Adds a filter which is used to filter the collection by testing each model against it. 
Triggers reset unless true is passed as last parameter. Multiple filters can be added as long as they have
different names. Adding two filters with the same name will result in the first being overwritten by the second.

example

	Facetr(collection).addFilter('AgeFilter', function(model) {
		return model.get('Age') >= 20 && model.get('Age') < 60; 
	});


##### <a name="facetcollection-removefilter"></a> removeFilter(filterName:string, [silent:boolean]) : FacetCollection

Removes the filter with the given name from the collection and unfilters it accordingly. 
Triggers reset unless true is passed as last parameter.

example

	Facetr(collection).removeFilter('AgeFilter');
	

##### <a name="facetcollection-clearfilters"></a> clearFilters([silent:boolean]) : FacetCollection

Removes all the filters previously added to the collection and unfilters it accordingly. 
Triggers reset unless true is passed as parameter.

example

	Facetr(collection).clearFilters();


##### <a name="facetcollection-clearvalues"></a> clearValues([silent:boolean]) : FacetCollection

Removes all the currently selected values from all the facets, bringing
the collection to its initial state.
Triggers a clearValues event unless true is passed as parameter.

example

	Facetr(collection).clearValues();


##### <a name="facetcollection-facetsorder"></a> facetsOrder(facetNames:Array) : FacetCollection

Sometimes it is convinient to give the facets list a predefined order. This method
can be used to achieve this by passing an array of facet names which corresponds to
the order to be given to the facets in the list.

example

	Facetr(collection).facet('Age');
	Facetr(collection).facet('Name.FirstName');

	// Facetr(collection).toJSON() has facet 'Age' at index 0 and 'Name.FirstName' at index 1

	Facetr(collection).facetsOrder(['Name.FirstName', 'Age']);

	// Facetr(collection).toJSON() has facet 'Name.FirstName' at index 0 and 'Age' at index 1


##### <a name="facetcollection-collection"></a> collection() : Backbone.Collection

Returns the reference to the Backbone.Collection. Useful for cases where the reference
is needed but it was declared in another scope and is no more accessible.

example

	Facetr(collection).collection() === collection; // true

##### <a name="facetcollection-origlength"></a> origLength() : Number

Returns the length of the collection before any faceted filtering was applied.

example

	var collection = new Backbone.Collection([
		{
			Name : 'John'
			Age	 : 19
		},
		{
			Name : 'Sarah',
			Age  : 35
		}
	]);

	collection.length() // 2

	Facetr(collection).facet('Age').value(35);

	collection.length(); // 1
	Facetr(collection).origLength(); // 2


##### <a name="facetcollection-settingsjson"></a> settingsJSON() : object

Returns an object representation of the current state of the Facetr collection which
can be used to reload the same state in future using the initFromSettingsJSON method.

example
	
	Facetr(collection).facet('Name.FirstName').label('First Name');
	Facetr(collection).sortBy('Name.FirstName').asc();
	Facetr(collection).facet('Name.FirstName').value('Bob');

	var json = Facetr(collection).settingsJSON();

	// value of json will be the following:
	//	
	// {
	//		sort : {
	//			by	:	"Name.FirstName",
	//			dir	:	"asc"
	//		},
	//		facets : [
	//			{
	//				attr	:	"Name.FirstName",
	//				eop		:	"and",
	//				iop		:	"or",
	//				vals	:	[ "Bob" ]
	//			}
	//		]
	//	}

##### <a name="facetcollection-initfromsettingsjson"></a> initFromSettingsJSON(json:object) : FacetCollection

Initializes the Facetr collection using a settings object generated
using the settingsJSON method.


### <a name="facet"></a> Facet

##### <a name="facet-value"></a> value(value:string, [operator:string]) : FacetExp

Adds a value to the facet. This will result in the collection being filtered
by { FacetName : 'Value' }. An operator ('and' or 'or') can be passed to change
the internal logical operator of the facet.
Triggers a 'filter' event passing facetName and facetValue to the handler.

example
	
	Facetr(collection).on('filter', function(facetName, facetValue) {
		console.log('filtered by '+ facetName + ' with value equal ' + facetValue);
	});

	Facetr(collection).facet('Name.FirstName').value('Bob');

	// console output: "filtered by Name.FirstName with value Bob"
	// collection contains only models with FirstName = 'Bob'

##### <a name="facet-removevalue"></a> removeValue(value:string) : FacetExp

Removes the given value from the facet and resets the collection to
the state previous of the filtering caused by the removed value.
Triggers an 'unfilter' event passing facetName and facetValue to the handler.

example
	
	Facetr(collection).on('unfilter', function(facetName, facetValue) {
		console.log('unfiltered by '+ facetName + ' with value equal ' + facetValue);
	});

	Facetr(collection).facet('Name.FirstName').removeValue('Bob');

	// console output: "unfiltered by Name.FirstName with value Bob"
	// collection contains again also models with FirstName = 'Bob'

##### <a name="facet-tojson"></a> toJSON() : object

Returns an object representation of the current facet data and values.
Useful for rendering the facet to the page.

example

	// create a collection with two models
	var collection = new Backbone.Collection([
	    {
	        'Name'      : {
	            'FirstName' : 'Bob',
	            'LastName' : 'Smith'
	        },
	        'Age'       : 20
	    },
		{
			'Name' 		: {
				'FirstName' : 'Otto',
				'LastName' 	: 'Von Braun'
			},
			'Age'  		: 35
		}
	]);

	Facetr(collection).facet('Name.FirstName').label('First Name');
	Facetr(collection).facet('Name.FirstName').value('Bob');

	var json = Facetr(collection).facet('Name.FirstName').toJSON();

	// json is equal to:
	//
	//	{
	//		data : {
	//			extOperator : 'and',
	//			intOperator : 'or',
	//			label       : 'First Name',
	//			name        : 'Name.FirstName',
	//			selected    : true,
	//			sort		: {
	//				by 		  : 'value',
	//				direction : 'asc'
	//			}
	//			customData : {}
	//		},
	//		values : [
	//			{
	//				active 		: true,
	//				activeCount : 1,
	//				count		: 1,
	//				value		: 'Bob'
	//			},
	//			{
	//				active 		: false,
	//				activeCount : 0,
	//				count		: 1,
	//				value		: 'Otto'
	//			}
	//		]
	//	}

##### <a name="facet-label"></a> label(label:string) : Facet

Use this method to set a human readable label for the facet.
This can be used when rendering the facet on the page.

example:
	
	Facetr(collection).facet('Name.FirstName').label('First Name');

	Facetr(collection).facet('Name.FirstName').toJSON();

	// the property data.label has value 'First Name'
	// while the property data.name stays 'Name.FirstName'

##### <a name="facet-sortbycount"></a> sortByCount() : Facet

Sorts the facet values by their count. The count is the number 
of models in the original collection with an attribute having as name 
the facet name and value the given value.

example

	// we use the colleciton defined in Basic Usage section
	var facet = Facetr(collection).facet('Hobbies');
	
	facet.value('painting'); // painting count = 3  
	facet.value('drawing');  // drawing count = 1

	// facet.toJSON().data.values[0] = 'drawing'
	// facet.toJSON().data.values[1] = 'painting'

	facet.sortByCount();

	// facet.toJSON().data.values[0] = 'painting'
	// facet.toJSON().data.values[1] = 'drawing'

##### <a name="facet-sortbyactivecount"></a> sortByActiveCount() : Facet

Sorts the facet values by their active count. The active count is the number
of models in the current filtered collection with an attribute having as name
the facet name and value the given value.

example

	var facet = Facetr(collection).facet('Hobbies');
	
	facet.value('fishing');   
	facet.value('shopping');  

	// fishing active count = 1
	// shopping active count = 2

	// facet.toJSON().data.values[0] = 'fishing'
	// facet.toJSON().data.values[1] = 'shopping'

	facet.sortByActiveCount();

	// facet.toJSON().data.values[0] = 'shopping'
	// facet.toJSON().data.values[1] = 'fishing' 

##### <a name="facet-sortbyvalue"></a> sortByValue() : Facet

Sorts the facet values by their value. This is the default sort.

##### <a name="facet-asc"></a> asc() : Facet

Sets the direction of the values sort to ascendent.

example

	Facetr(collection).facet('Name.FirstName').asc();

##### <a name="facet-desc"></a> desc() : Facet

Sets the direction of the values sort to descendant.

example

	Facetr(collection).facet('Name.FirstName').sortByCount().desc();

##### <a name="facet-remove"></a> remove() : undefined

Removes the facet and all its values and unfilters the collection accordingly.

##### <a name="facet-clear"></a> clear() : Facet

Unselects all the values from the facet. It triggers a 'unfilter' event for each removed value.

##### <a name="facet-customdata"></a> customData(key:string, [value:object]) : Facet

This method can be used to add arbitrary data to pass to the templates.
Data added using this method is included in the object returned by the toJSON() method
in the data.customData property.
To retrieve previously set data, just pass the key parameter without any value.

example

	var facet = Facetr('myCollection').facet('Hobbies').customData('sublabel', 'Available hobbies');

	// facet.customData('sublabel') returns 'Available hobbies'
	// facet.toJSON().data.customData = { sublabel : 'Available hobbies' }

##### <a name="facet-isselected"></a> isSelected : Boolean

Returns true if any value is selected from this facet, false otherwise.

example

	var facet = Facetr('myCollection').facet('Hobbies');

	facet.value('fishing');

	// facet.isSelected() returns true

	facet.clear(); // remove all selected values

	// facet.isSelected() returns false


### <a name="facetexp"></a> FacetExp

FacetExp objects are returned from Facet value and removeValue methods.
They can be used to coincisely define multiple values on a facet, using
different operators.

example

	Facetr(collection).facet('Age').value(12, 'and');
	Facetr(collection).facet('Age').value(15, 'or');
	Facetr(collection).facet('Age').value(39, 'and');

	// can also be expressed with the following syntax

	Facetr(collection).facet('Age').value(12, 'and').or(15).and(39);

##### <a name="facetexp-and"></a> and(value:string) : Facet

Equivalent to facet.value('Value', 'and'), but can be used for FacetExp chains.

##### <a name="facetexp-or"></a> or(value:string) : Facet

Equivalent to facet.value('Value', 'or'), but can be used for FacetExp chains.


### <a name="examples"></a> EXAMPLES

This section contains a list of websites / projects using Facetr.

* [terra-vecchia.ch](http://terra-vecchia.ch/sozialtherapie/angebote-und-betriebe)


### <a name="license"></a> LICENSE

Backbone.Facetr may be freely distributed under the MIT license.

Copyright (C) 2012-2013 Arillo GmbH http://arillo.net

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies 
of the Software, and to permit persons to whom the Software is furnished to do so, 
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.
