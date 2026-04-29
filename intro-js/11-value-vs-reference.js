// los primitivos pasan por valor. Los primitivos son: string, number, boolean, null, undefined y symbol.
let originalNum = 10;
let copiedNum = originalNum;
console.log(originalNum);
console.log(copiedNum);
copiedNum += 23;
console.log(originalNum);
console.log(copiedNum);

//Los objetos pasan por referencia. Los objetos son: object, array y function. Todo en JS es un objeto, excepto los primitivos.
let originalObj = { name: "Alice", age: 30 };
let copiedObj = originalObj;
console.log(originalObj);
console.log(copiedObj);
copiedObj.age += 5;
console.log(originalObj);
console.log(copiedObj);

// Para evitar esto, podemos crear una copia del objeto. Para objetos simples, podemos usar el operador spread o Object.assign. Para objetos más complejos, podemos usar librerías como lodash o structuredClone.
let originalObj2 = { name: "Bob", age: 25 };
let copiedObj2 = { ...originalObj2 }; // o Object.assign({}, originalObj2);
console.log(originalObj2);
console.log(copiedObj2);
copiedObj2.age += 5;
console.log(originalObj2);
console.log(copiedObj2);

//Un ejemplo con arrays:
let originalArr = [1, 2, 3];
let copiedArr = originalArr;
console.log(originalArr);
console.log(copiedArr);
copiedArr.push(4);
console.log(originalArr);
console.log(copiedArr);

// Para copiar un array, podemos usar el operador spread o Array.from:
let originalArr2 = [1, 2, 3];
let copiedArr2 = [...originalArr2]; // o Array.from(originalArr2);
console.log(originalArr2);
console.log(copiedArr2);
copiedArr2.push(7);
console.log(originalArr2);
console.log(copiedArr2);