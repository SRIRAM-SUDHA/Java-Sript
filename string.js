let myName = 'sriram'
let numbers = '012345'
console.log(myName)
console.log(myName.charAt(3))
console.log(myName.at(-2))
console.log(myName[0])

// concat
let mySurName = 'sudha'
console.log(myName+mySurName)
console.log(myName.concat(mySurName))


//extracting

let firstName = myName.slice(0,3)
console.log(firstName)

//upeer || lower
console.log(myName.toUpperCase())
console.log(myName.toLowerCase())

//remove and adding
let myNameWithSpace = "  "+ myName+" "
console.log(myNameWithSpace)
console.log(myNameWithSpace.trim())
console.log(myNameWithSpace.trimStart())
console.log(myNameWithSpace.trimEnd())

console.log(myNameWithSpace.length)
//less than the length its ignore the operation
console.log(myNameWithSpace.padStart(10,"1"))
console.log(myNameWithSpace.padStart(12,"1"))
console.log(myNameWithSpace.padStart(13,"1"))
console.log(myNameWithSpace.padStart(14,"1"))

console.log(myNameWithSpace.padEnd(10,"1"))
console.log(myNameWithSpace.padEnd(12,"1"))
console.log(myNameWithSpace.padEnd(13,"1"))
console.log(myNameWithSpace.padEnd(14,"1"))

// repeating
let repeatName = myName.repeat(3)
console.log(repeatName)

//replace
console.log(myName)
console.log(myName.replace("ram" ))
console.log(myName.replace("ram" , "ramesh"))

console.log(repeatName)
console.log(repeatName.replace("ram" ))
console.log(repeatName.replace("ram" , "ramesh"))

console.log(repeatName)
console.log(repeatName.replace("ram" ))
console.log(repeatName.replace("ram" , "ramesh"))

console.log(repeatName)
console.log(repeatName.replaceAll("ram" ))
console.log(repeatName.replaceAll("ram" , "ramesh"))

//string to array
let nameArr = myName.split("")
console.log(nameArr)


// STRING SEARCH
let text = "Please locate where 'locate' occurs!";
console.log(text.indexOf('locate'))
// second arg to search from that postion
console.log(text.indexOf('locate',8))
console.log(text.lastIndexOf("locate"))

// index cant take second arg but do regex
console.log(text.search("locate"))
console.log(text.search(/locate/))

// The match() method returns an array containing 
// the results of matching a string against a string

text = "The rain in SPAIN stays mainly in the plain";
console.log(text.match("ain"))
console.log(text.match("ain").index)
console.log(text.match(/ain/g))
console.log(text.match(/ain/gi))


console.log(text.includes('ain'))
console.log(text.includes('ain', 13))

console.log(text.startsWith('The'))
// will not support the regular expression
// console.log(text.startsWith(/the/i))

console.log(text.endsWith('plain'))
