// The toString() method returns a number as a string.
// All number methods can be used on any type of numbers (literals, variables, or expressions):


let x = 123
console.log(x.toString()) // '123'
// convert the number to binary number (radix - 2nd arrgument)
console.log(x.toString(2)) // '1111011'

x = 123.4569

console.log(x.toExponential());
console.log(x.toExponential(2)); // '1.23e+2'

//it will fix the decimals after dot
console.log(x.toFixed()); // '123'
console.log(x.toFixed(1)); // '123.5'
console.log(x.toFixed(5)); // '123.45690'

//it will fix size of the number
console.log(x.toPrecision(1)); // '1e+2'
console.log(x.toPrecision(3)); // '123'


// Method       Description
// Number()  	Returns a number converted from its argument.
// parseFloat()	Parses its argument and returns a floating point number
// parseInt()	Parses its argument and returns a whole number
 
Number(true); // 1
Number(false); //0
Number("  10"); // 10
Number("10  "); // 10
Number(" 10  "); // 10
Number("10.33"); // 10
Number("10,33"); // NaN
Number("10 33"); // NaN

// parseInt() parses a string and returns a whole number. Spaces are allowed. Only the first number is returned:

parseInt("-10");
parseInt("-10.33");
parseInt("10");
parseInt("10.33");
parseInt("10 20 30");
parseInt("10 years");
parseInt("years 10"); // only this one NaN remaing 10


parseFloat("10");
parseFloat("10.33"); // this is 10.33 remaing 10
parseFloat("10 20 30");
parseFloat("10 years");
parseFloat("years 10"); // NaN

Math.abs(-7.25); // 7.25
Math.floor(5.1);// 5
Math.floor(-5.1); // -6
Math.max(0, 150, 30, 20, 38); // 150
Math.min(0, 150, 30, 20, 38); // 0

// The Math.pow() method returns the value of x to the power of y (xy).
Math.pow(4, 3);

// Return a random number between 0 (inclusive) and 10 (exclusive):
Math.random() * 10;
// Return a random number between 1 (inclusive) and 10 (inclusive):
Math.floor((Math.random() * 10) + 1);
// Returns a random integer from 0 to 99:
Math.floor(Math.random() * 100);
// Returns a random integer from 0 to 100:
Math.floor(Math.random() * 101);
// Returns a random integer from 1 to 100:
Math.floor(Math.random() * 100) + 1;

Math.round(2.60); // 3

// The Math.trunc() method removes the decimals (does NOT round the number).
// Math.trunc(8.76)

