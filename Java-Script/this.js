"use strict";

// this in global scope

console.log(this);
// its points to the global object in window in browser and in node its global

//this inside a function

function x() {
	console.log(this);

	// it refers to global
	// strict mode: it refers to undefined
}

x();

// this inside non- StrictMode - (this substitution)

/*
if the value of this keyword is undefined or null 
this keyword will be replaced eith globalObject
only in non strict mode
*/

// this keyword depends on how the function is called
// in strict mode
x(); // undefined
// window.x(); // window object

// this inside a object's method
const obj = {
	name: "sriram",
	x: function () {
		console.log(this);
	},
	sayMyName: function () {
		console.log(this.name);
	},
};

obj.x(); // obj
obj.sayMyName(); // sriram

// this inside a nested function

const obj2 = {
	name: "sriram",
	sayMyName: function () {
		console.log(this.name);
	},
	nested: {
		sayMyName: function () {
			console.log(this.name);
		},
	},
};

obj2.sayMyName(); // sriram
obj2.nested.sayMyName(); // undefined

const obj3 = {
	name: "ramesh",
};

// obj3.sayMyName(); // error

// call
obj.sayMyName.call(obj3); // sriram

// this inside a arrow function
const obj4 = {
	name: "satya",
	sayMyName: function () {
		console.log(this.name);
		const nestedFun = () => {
			console.log(this.name);
		};
		return nestedFun();
	},
};

obj4.sayMyName(); // sriram
