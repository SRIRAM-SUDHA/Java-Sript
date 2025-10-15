let name1 = {
	firstName: "sriram",
	lastName: "sudha",
	printFullName: function () {
		console.log(this.firstName + " " + this.lastName);
	},
};

let name2 = {
	firstName: "ramesh",
	lastName: "kumar",
};

// call
// function borrowing
let printFirstName = function (hometown, state) {
	console.log(
		this.firstName + " " + this.lastName + " from " + hometown + ", " + state
	);
};

printFirstName.call(name1, "andhra", "pradesh"); // sriram from andhra, pradesh
printFirstName.call(name2, "bihar", "patna"); // ramesh from bihar, patna

name1.printFullName.call(name2); // ramesh kumar

// apply
printFirstName.apply(name1, ["andhra", "pradesh"]); // sriram from andhra, pradesh
printFirstName.apply(name2, ["bihar", "patna"]); // ramesh from bihar, patna

name1.printFullName.apply(name2); // ramesh kumar

// bind
// it gives u a function which u can call later
let printMyName = printFirstName.bind(name1, "andhra", "pradesh");
printMyName(); // sriram from andhra, pradesh

let printMyName2 = printFirstName.bind(name2, "bihar", "patna");

printMyName2(); // ramesh from bihar, patna

name1.printFullName.bind(name2)(); // ramesh kumar

// ---------------------------

// function currying
let multiply = function (x, y) {
	console.log(x * y);
};

let multiplyByTwo = multiply.bind(this, 2);
multiplyByTwo(5); // 10

// ---------------------------
// using closures
let multiplyC = function (x) {
	return function (y) {
		console.log(x * y);
	};
};
let multiplyByTwoC = multiplyC(2);
multiplyByTwoC(5); // 10

// ---------------------------
// using arrow function
let multiplyA = (x) => (y) => console.log(x * y);
let multiplyByTwoA = multiplyA(2);
multiplyByTwoA(5); // 10

// ---------------------------

function sum(...args1) {
	let total = args1.reduce((a, b) => a + b, 0);

	function inner(...args2) {
		return sum(total, ...args2);
	}
	inner.valueOf = () => total;
	return inner;
}

console.log(+sum(2)(4)(6)); // 12
console.log(+sum(3, 2)(5)); // 10
console.log(+sum(4)(-10, -6)); // -12
console.log(+sum(6, -3, 1)); // 4
