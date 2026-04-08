// const cities = [
//     "Tokyo",
//     "Buenos Aires",
//     "Nueva York",
//     "Londres",
//     "París",
//     "Berlín",
//     "Ciudad de México",
//     "Shanghái",
//     "El Cairo",
//     "Sídney"
// ];

// for (let i = 0; i < cities.length; i++) {
//     console.log(cities[i]);

// }
// cities.forEach(city => console.log(city));


const country01 = {
    name: "Argentina",
    population: 45000000,
    capital: "Buenos Aires",
    languages: ["Español", "Inglés"],
    currency: "Peso argentino",
};

const country02 = {
    name: "Japón",
    population: 126000000,
    capital: "Tokio",
    languages: ["Japonés"],
    currency: "Yen"
};

const country03 = {
    name: "Francia",
    population: 67000000,
    capital: "París",
    languages: ["Francés"],
    currency: "Euro",
    soccerJoke() {
        console.log("Salí segundo");
    }
};
country03.soccerJoke();
// const countries = [country01, country02, country03];

// // for (let i = 0; i < countries.length; i++) {
// //     console.log(`Name: ${countries[i].name} - Capital: ${countries[i].capital}`);
// // }

// countries.forEach(country => console.log(`${country.name} -  ${country.capital}`));
// console.log(countries[5]);

//CommonJS

// const data = require("./data.json");

// ES6 Modules -> modern JS
import data from "./data.json" with { type: "json" };


// filtrar por continente asiático
// data.forEach(country => {
//     if (country.region === "Asia") {
//         console.log(`${country.name.common} - ${country.capital}`);
//     }
// }
// );

// const asiaticCountries = data.filter((country) => country.region === "Asia");
// console.log(asiaticCountries);

//loose equality == -> compara solo el valor
//strict equality === -> compara el valor y el tipo de dato

// const num1 = 10;
// const num2 = "10";
// console.log(num1 === num2);
// const saldo = num1 + num2;
// console.log(typeof saldo);

country01.name = "Aryentain";
country01.copasDelMundo = 3;
console.log(country01);
//comentario para ver el cambio en git
