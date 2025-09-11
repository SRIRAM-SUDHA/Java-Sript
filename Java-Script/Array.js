let arr = [1, 2, 3, 4, 5, 5, 6, 7, 8, 9];
let allArr = ["a", "b", "c", "d", "e", "f", "g"];
// length
console.log(arr.length); // 10
console.log(arr.toString()); // '1,2,3,4,5,5,6,7,8,9'

//index
console.log(arr[0]); // 1
console.log(arr[90]); // undefined
console.log(arr.at);

console.log(arr.join(" ")); // '1 2 3 4 5 5 6 7 8 9'

console.log(arr.pop()); // 9
console.log(arr); //Array(9) [ 1, 2, 3, 4, 5, 5, 6, 7, 8 ]
console.log(arr.push(9)); // 10
console.log(arr); // Array(10) [ 1, 2, 3, 4, 5, 5, 6, 7, 8, 9 ]
console.log(arr.shift()); // 1
console.log(arr.unshift(11)); // 10 (its length)
console.log(arr); // Array(10) [ 11, 2, 3, 4, 5, 5, 6, 7, 8, 9 ]

// it will leave the holes
delete arr[0];
console.log("hello");
console.log(arr); //Array(10) [ undefined, 2, 3, 4, 5, 5, 6, 7, 8, 9 ]

let conCat = arr.concat(allArr);
console.log(conCat);
Array(17); // [undefined, 2, 3, 4, 5, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f', 'g']

const myArr = [
	[1, 2],
	[3, 4],
	[5, 6],
];
const newArr = myArr.flat();
console.log(newArr); // Array(6) [ 1, 2, 3, 4, 5, 6 ]

// splice(index, no of items, items to addd)

console.log(arr.splice(2, 2));
console.log(arr);

const slicedItems = arr.toSpliced(2, 4);
console.log(slicedItems);

const fruits = ["Banana", "Orange", "Lemon", "Apple", "Mango"];
const citrus = fruits.slice(1);
console.log(citrus);

// Search
console.log(citrus.indexOf("Orange")); // 0
console.log(citrus.indexOf("Orange", 2)); // -1

console.log(citrus.includes("Orange")); // true

// returns first element that passed the condition
console.log(
	arr.find(function (value, index, array) {
		return value > 2;
	})
);

// returns first element's index that passed the condition
console.log(
	arr.findIndex(function (value, index, array) {
		return value > 2;
	})
);

// sort
fruits.sort();
console.log(fruits); //[ 'Apple', 'Banana', 'Lemon', 'Mango', 'Orange' ]

fruits.reverse();
console.log(fruits);
["Orange", "Mango", "Lemon", "Banana", "Apple"];

const points = [40, 100, 1, 5, 25, 10];
points.sort(function (a, b) {
	return a - b;
});
console.log(points); // Array(6) [ 1, 5, 10, 25, 40, 100 ]

points.sort(function (a, b) {
	return b - a;
});
console.log(points); //Array(6) [ 100, 40, 25, 10, 5, 1 ]

const cars = [
	{ type: "Volvo", year: 2016 },
	{ type: "Saab", year: 2001 },
	{ type: "BMW", year: 2010 },
];

cars.sort((a, b) => a.year - b.year);
console.log(cars);
// [
//   { type: 'Saab', year: 2001 },
//   { type: 'BMW', year: 2010 },
//   { type: 'Volvo', year: 2016 }
// ]

cars.sort((a, b) => {
	let x = a.type.toLowerCase();
	let y = b.type.toLowerCase();
	if (x < y) return -1;
	if (x > y) return 1;
	return 0;
});
console.log(cars);
// [
//   { type: 'BMW', year: 2010 },
//   { type: 'Saab', year: 2001 },
//   { type: 'Volvo', year: 2016 }
// ]

const numbers = [45, 4, 9, 16, 25];

let text = "";
numbers.forEach(concating);

function concating(value) {
	console.log(value);
	text += value;
}
console.log(text);

console.log(numbers.map((value) => value * 2));
console.log(numbers.filter((value) => value > 40));
console.log(numbers.reduce((total, value) => value + total, 100));
console.log(numbers.every((value) => value > 10));
console.log(numbers.some((value) => value > 10));
console.log(Array.from("sriram"));
console.log(Math.max(...numbers));
console.log(Math.max.apply(null, numbers));
