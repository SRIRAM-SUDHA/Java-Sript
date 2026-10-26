
Array.prototype.myFilter = function(callback){
    if (typeof callback !== "function") throw new Error(callback + "is not callback function");

    const result = []
    for (let i = 0; i < this.length; i++){
        let processedValue = callback(this[i], i , this)

        if (processedValue) result[result.length] = this[i]
    }
    return result
}




const arr = [2,4,5,5,6,7,9]

arr.myFilter(((val)=> val %2 === 0))

window.open("example.com")