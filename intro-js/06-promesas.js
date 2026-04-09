// // Cómo maneja JS las operaciones asíncronas
// const asyncRandomNumber = new Promise((resolve, reject) => {
//     setTimeout(() => {
//         const randomNumber = Math.random();
//         if (randomNumber > 0.5) {
//             resolve(randomNumber);
//         } else {
//             reject("El número es menor o igual a 0.5");
//         }
//     }, 3000);
// });

// asyncRandomNumber
//     .then((number) => {
//         let doubleNumber = number * 2;
//         console.log(`El número generado es: ${number}`);
//         console.log(`El número generado multiplicado por 2 es: ${doubleNumber}`);
//         console.log(`El número generado es: ${number}`);
//     })
//     .catch((err) => console.log(`Error: ${err}`))
//     .finally(() => console.log("La promesa ha sido resuelta o rechazada"));
//El finally se ejecuta siempre, sin importar si la promesa fue resuelta o rechazada. Es útil para limpiar recursos -cleanup- o realizar acciones que deben ocurrir independientemente del resultado de la promesa.

// console.log("Esto es urgente y no podemos esperar tu tonta promesa!!!");
// console.log("Esta suma es importantísima para el Artemis 2:", 6 + 3);

fetch("https://rickandmortyapi.com/api/character")
    .then((res) => res.json())
    .then((data) => {
        data.results.forEach((character, idx) => {
            console.log(`${idx + 1}: ${character.name}`);
        });
    })
    .catch((err) => console.log(`Error: ${err}`));
