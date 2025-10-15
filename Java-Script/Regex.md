In JavaScript, regular expressions (regex) are powerful tools for pattern matching and manipulation within strings. They can be created in two ways: regular expression literal. 
This is the most common and concise way to create a regex. The pattern is enclosed between forward slashes (/). 
    const regexLiteral = /pattern/flags;
    // Example:
    const caseInsensitiveMatch = /hello/i; // Matches "hello" case-insensitively

RegExp Constructor. 
This method allows for dynamic creation of regex patterns, where the pattern itself might be a variable. The pattern is passed as a string to the RegExp constructor. [1]  
    const regexConstructor = new RegExp("pattern", "flags");
    // Example:
    const dynamicPattern = "world";
    const dynamicRegex = new RegExp(dynamicPattern, "g"); // Matches all occurrences of "world"

Key JavaScript Methods Utilizing Regular Expressions: 
RegExp Object Methods: 

• test(string): Checks if a string contains a match for the regex. Returns true or false. 

    const pattern = /apple/;
    console.log(pattern.test("I like apples.")); // true

• exec(string): Searches for a match in a string and returns an array containing information about the match (including captured groups) or null if no match is found. Repeated calls on the same regex with the g flag will find subsequent matches. 

    const pattern = /(\w+)\s(\w+)/g;
    const result = pattern.exec("first second");
    console.log(result); // ["first second", "first", "second", index: 0, input: "first second", groups: undefined]

String Object Methods: 

• match(regex): Returns an array containing all matches (if the g flag is used) or null if no matches are found. If the g flag is not used, it behaves similarly to exec(). 

    const text = "apple banana apple";
    const matches = text.match(/apple/g);
    console.log(matches); // ["apple", "apple"]

• matchAll(regex): Returns an iterator containing all matches, including capture groups. Requires the g flag. 

    const text = "apple banana apple";
    const matchesIterator = text.matchAll(/apple/g);
    for (const match of matchesIterator) {
        console.log(match);
    }

• replace(regex, replacement): Replaces occurrences of the pattern found by the regex with the specified replacement string or a function. 

    const text = "Hello world!";
    const newText = text.replace(/world/, "JavaScript");
    console.log(newText); // "Hello JavaScript!"

• replaceAll(regex, replacement): Replaces all occurrences of the pattern found by the regex with the specified replacement. Requires the g flag. 

    const text = "one two one three";
    const newText = text.replaceAll(/one/g, "four");
    console.log(newText); // "four two four three"

• search(regex): Returns the index of the first match found, or -1 if no match is found. 

    const text = "The quick brown fox";
    const index = text.search(/quick/);
    console.log(index); // 4

• split(regex): Divides a string into an ordered list of substrings based on the pattern defined by the regex. 

    const text = "one-two-three";
    const parts = text.split(/-/);
    console.log(parts); // ["one", "two", "three"]

AI responses may include mistakes.

[1] https://www.honeybadger.io/blog/javascript-regular-expressions/

