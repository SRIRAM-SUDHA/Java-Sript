// const p1 = new Promise((resolve, reject) => {
// 	setTimeout(() => resolve("P1 sucess"), 3000);
// });

// const p2 = new Promise((resolve, reject) => {
// 	setTimeout(() => {
// 		// throw new Error("P2 faill"); not works in timers
// 		if (!true) {
// 			resolve("P2 is success");
// 		}
// 		reject(new Error("P2 is failed"));
// 	}, 1000);
// });

// const p3 = new Promise((resolve, reject) => {
// 	setTimeout(() => {
// 		resolve("P3 success");
// 	}, 2000);
// });

// // settled can be succes or failure
// // return the first settled result  // least time taken
// Promise.race([p1, p2, p3])
// 	.then((res) => {
// 		console.log(res);
// 	})
// 	.catch((err) => {
// 		console.error(err.message);
// 	});

// // it will wait for first settled success else give aggregatorError and  list of reject response console.log(err.errors)

// Promise.any([p1, p2, p3])
// 	.then((res) => {
// 		console.log(res);
// 	})
// 	.catch((err) => {
// 		console.error(err.message);
// 	});

// Promise.all([p1, p2, p3])
// 	.then((res) => {
// 		console.log(res);
// 	})
// 	.catch((err) => {
// 		console.error(err.message);
// 	});

// // reject:  P2 is failed
// // All Success : [ 'P1 sucess', 'P2 is success', 'P3 success' ]

// Promise.allSettled([p1, p2, p3]).then((result) => {
// 	const cleanResult = result.map((res) => {
// 		if (res.status === "rejected") {
// 			// console.log(res.reason);
// 			return { status: res.status, reason: res.reason.message };
// 		}
// 		return res;
// 	});
// 	console.log(cleanResult);
// });

// // [
// //   { status: 'fulfilled', value: 'P1 sucess' },
// //   { status: 'rejected', value: 'P2 is Failed' },
// //   { status: 'fulfilled', value: 'P3 success' }
// // ]

// ---------------------------

// async
// what is async:
// it always return a Promise neither u return promise or anything,  it always wrapped in promise

async function getData() {
	return "Namaste";
}

const dataPromise = getData();
console.log(dataPromise); // Promise { 'Namaste' }

dataPromise.then((res) => console.log(res)); // Namaste

const p = new Promise((res, rej) => {
	res("Promise resolved");
});

async function dataPromis() {
	console.log(await p, "hello");
	return p;
}

const dataP = dataPromis();

console.log(dataP);

function check1() {
	dataP.then((res) => {
		console.log(res);
	}); // this later

	console.log("namste JS"); // this prints first
}

check1();

// async and await are used to handle Promise

// await can only be used in async function

async function dataFetch() {
	const data = await fetch(
		"https://jsonplaceholder.typicode.com/comments?postId=1"
	);
	const res = await data.json();
	console.log(res);
}

dataFetch();
