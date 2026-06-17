Java is a popular and powerful programming language, created in 1995.

It is owned by Oracle, and more than 3 billion devices run Java.

It is open-source and free

to check the java version C:\Users\Your Name>java -version

To compile the code javac Main.java

To Run the code "java Main"

Every line of code that runs in Java must be inside a class. The class name should always start with an uppercase first letter. In our example, we named the class Main.

Its case sensitive 	

Java uses the class name to find and run your code

The curly braces {} mark the beginning and the end of a block of code.

System.out.println() may look long, but you can think of it as a single command that means: "Send this text to the screen."

Here's what each part means (you will learn the details later):

System is a built-in Java class.
out is a member of System, short for "output".
println() is a method, short for "print line".


### Output

- Text must be wrapped inside double quotations marks "".
- **print()** used to print without inserting a newline
- **print()** used to add the new line at the end

### Comment

- Single-line comments start with two forward slashes (//).
- Multi-line comments start with /* and ends with */.

### Variables
 Variables are container for storing the data 
 - String - stores text, such as "Hello". String values are surrounded by double quotes
 - int - stores integers (whole numbers), without decimals, such as 123 or -123
 - float - stores floating point numbers, with decimals, such as 19.99 or -19.99
 - char - stores single characters, such as 'a' or 'B'. Char values are surrounded by single quotes
 - boolean - stores values with two states: true or false
 - ***All Variables excet the String are lowercase***

 ``` java
int myNum = 5;
float myFloatNum = 5.99f;
char myLetter = 'D';
boolean myBool = true;
String myText = "Hello";
```

```java
type variableName = value;
int num = 10
```

- You can change the value of the variables

```java
int myNum = 15;
myNum = 20;  // myNum is now 20
System.out.println(myNum);
```

- If you don't want others (or yourself) to overwrite existing values, use the final keyword  

```java
final int myNum = 15;
myNum = 20;  // will generate an error: cannot assign a value to a final variable
```

- **Declare Many Variables**
```java
int x = 5;
int y = 6;
int z = 50;
System.out.println(x + y + z); // 61

// We can write like this 
int x = 5, y = 6, z = 50;
System.out.println(x + y + z); // 61

// One value to multiple variables
int x, y, z;
x = y = z = 50;
System.out.println(x + y + z); // 150
```

 - **Identifiers**
    - All Java variables must be identified with unique names. These unique names are called identifiers.
    - Names can contain letters, digits, underscores, and dollar signs
    - Names must begin with a lowercase letter amd also  $ and _
    

## Data Types
Data types are divided into two groups 

 - **Primitive data types** - includes byte, short, int, long, float, double, boolean and char
 - **Non-primitive data types** - such as String, Arrays and Classes 

| Data Type | Description |
|--------------|-------------|
| byte | Stores whole numbers from -128 to 127 |
| short | Stores whole numbers from -32,768 to 32,767 |
| int | Stores whole numbers from -2,147,483,648 to 2,147,483,647 |
| long | Stores whole numbers from -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807  ends with *l*|
| float | Stores fractional numbers. Sufficient for storing 6 to 7 decimal digits ends with *f*|
| double | Stores fractional numbers. Sufficient for storing 15 to 16 decimal digits  and ends with *d*|
| boolean | Stores **true** or **false** values |
| char | Stores a single character/letter or ASCII values surround by single quote **'a'** |

- ***int and double are commonly used data types***

**You can't change the type of the variable**
```java
int myNum = 5;       // myNum is an int
// myNum = "Hello";  // Error: cannot assign a String to an int

String myText = "Hi"; // myText is a String
// myText = 123;      // Error: cannot assign a number to a String
```

 - **Non-Primitive Data Types**
   - Primitive types in Java are predefined and built into the language, while non-primitive types are created by the programmer (except for String).
   - Non-primitive types can be used to call methods to perform certain operations, whereas primitive types cannot.
   - Primitive types start with a lowercase letter (like int), while non-primitive types typically starts with an uppercase letter (like String).
   - Primitive types always hold a value, whereas non-primitive types can be null

 - **Var**
   1. The var keyword was introduced in Java 10 (released in 2018).
   1. The var keyword lets the compiler automatically detect the type of a variable based on the value you assign to it.

        ```java
        var myNum = 5;         // int
        var myDouble = 9.98;   // double
        var myChar = 'D';      // char
        var myBoolean = true;  // boolean
        var myString = "Hello"; // String
        ```
    1. var only works when you assign a value at the same time
        ```java
        var x; // Error
        var x = 5;  // OK
        ``
    1. **Once the type is chosen, it stays the same**

## Type Casting
 - Type casting means converting one data type into another. For example, turning an int into a double

 ```markdown
 **Widening Casting (automatic)** - converting a smaller type to a larger type size
 `byte -> short -> char -> int -> long -> float -> double`

 **Narrowing Casting (manual)** - converting a larger type to a smaller type size
double -> float -> long -> int -> char -> short -> byte
```

 - Narrowing casting must be done manually by placing the type in parentheses () in front of the value.

```java
double myDouble = 9.78d;
int myInt = (int) myDouble; // Manual casting: double to int

System.out.println(myDouble); // Outputs 9.78
System.out.println(myInt);    // Outputs 9
```

## Operators

*When dividing two integers in Java, the result will also be an integer. For example,**10 / 3 gives 3.** If you want a decimal result, use double values, like **10.0 / 3**.*

## String
 - Strings are used for storing text `String greeting = "Hello";`
 - txt.length()
 - `text.toUpperCase()` , `text.toLowerCase()` 
 - indexOf() method returns the index (the position) of the first occurrence of a specified text in a string `txt.indexOf("locate")`
 - `txt.charAt(0)` to access a char at specified index
 - `equals()` to compare the string
 
 - ``` java 
    String txt1 = "Hello";
    String txt2 = "Hello";

    String txt3 = "Greetings";
    String txt4 = "Great things";

    System.out.println(txt1.equals(txt2));  // true
    System.out.println(txt3.equals(txt4));  // false
    ```
  - `trim()` to trin the ends
  - we can use **+** or **txt1.concat(txt2)** to combine the string


## Math
 - **Math.max(x,y)** and **Math.min(x,y)** , **Math.sqrt(x)** , **Math.abs(x)**, **Math.pow(x, y)**

 - ```java  
    Math.round(4.6);  // 5
    Math.ceil(4.1);   // 5.0
    Math.floor(4.9);  // 4.0
    ```

- **Math.random()** returns a random number between 0.0 (inclusive), and 1.0 (exclusive):  `int randomNum = (int)(Math.random() * 101);  // 0 to 100`

## ifelse

- ```java
    variable = (condition) ? expressionTrue :  expressionFalse;
    ```

- ```java
    if (condition1) {
    // block of code to be executed if condition1 is true
    } else if (condition2) {
    // block of code to be executed if condition1 is false and condition2 is true
    } else {
    // block of code to be executed if both conditions are false
    }
    ```


## Switch
 - Instead of writing many if..else statements, you can use the switch statement
 - ```java
    switch(expression) {
    case x:
        // code block
        break;
    case y:
        // code block
        break;
    default:
        // code block
    }
    ```

## Loops

- Loops can execute a block of code as long as a specified condition is true.
- A while loop may never run if the condition is false from the start
```java
while (condition) {
  // code block to be executed
}
```
- **Do/While** loop - The do/while loop is a variant of the while loop. This loop will execute the code block once, before checking if the condition is true. Then it will repeat the loop as long as the condition is true.

```java
do {
  // code block to be executed
}
while (condition)
```

```java
for (statement 1; statement 2; statement 3) {
  // code block to be executed
}
Statement 1 - is executed (one time) before the execution of the code block.

Statement 2 - defines the condition for executing the code block.

Statement 3 - is executed (every time) after the code block has been executed.

```
## for-each
- There is also a "for-each" loop, which is used exclusively to loop through elements in an array 

```java
for (type variableName : arrayName) {
  // code block to be executed
}

String[] cars = {"Volvo", "BMW", "Ford", "Mazda"};

for (String car : cars) {
  System.out.println(car);
}


int[] numbers = {10, 20, 30, 40};

for (int num : numbers) {
  System.out.println(num);
}
```

## break/ continue
- The break statement can also be used to jump out of a loop
```java
for (int i = 0; i < 10; i++) {
  if (i == 4) {
    break;
  }
  System.out.println(i);
}
```
- The continue statement breaks one iteration (in the loop), if a specified condition occurs, and continues with the next iteration in the loop
```java 
for (int i = 0; i < 10; i++) {
  if (i == 4) {
    continue;
  }
  System.out.println(i);
}
```

## Arrays
Arrays are used to store multiple values in a single variable, instead of declaring separate variables for each value.

-  To declare an array, define the variable type with square brackets [ ] :
- `curly braces { }`
- `String[] cars = {"Volvo", "BMW", "Ford", "Mazda"};`
- `int[] myNum = {10, 20, 30, 40};`
- `int[][] myNumbers = { {1, 4, 2}, {3, 6, 8} };` is the multi dimensional array
- You can also create an array by specifying its size with new. This makes an empty array with space for a fixed number of elements, which you can fill later:



```
Note: You cannot write new String[4] {"Volvo", "BMW", "Ford", "Mazda"}.

In Java, when using new, you either:

Use new String[4] to create an empty array with 4 slots, and then fill them later
Or use new String[] {"Volvo", "BMW", "Ford", "Mazda"} (without specifying the number of elements) to create the array and assign values at the same time
Tip: The shortcut syntax is most often used when the values are known at the start. Use new with a size when you want to create an empty array and fill it later.
```