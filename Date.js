console.log(new Date);

const d = new Date("2015-03-25T12:00:00Z");

// Date and time is separated with a capital T.
// UTC time is defined with a capital letter Z.
// If you want to modify the time relative to UTC, remove the Z and add +HH:MM or -HH:MM instead:
// const d = new Date("2015-03-25T12:00:00-06:30");

d.setFullYear('2024')
console.log(d);
d.setHours(2,45,32)
console.log(d);
console.log(d.getFullYear());
console.log(d.toString());


let date = "2015-03-25"
console.log(new Date(Date.parse(date)))

const dateStringNonISO = "10/26/2023";
const dateObjectNonISO = new Date(dateStringNonISO);
console.log(dateObjectNonISO);

const now = new Date();
const dateOnlyString = now.toDateString();
console.log(dateOnlyString);

const nowISO = new Date();
const dateStringISO = nowISO.toISOString();
console.log(dateStringISO);

const custom = new Date();
const formattedDate = custom.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});
console.log(formattedDate);
