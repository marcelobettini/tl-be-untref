// import { users } from "./users.js";



// const usersJSON = JSON.stringify(users);

// console.log(usersJSON[0]);
// const objectAgain = JSON.parse(usersJSON);

// console.log(objectAgain[0]);


//Node JS puede leer archivos JSON directamente sin necesidad de convertirlos a objetos, gracias a la función require() o import con type: "json". En versiones anteriores se utilizaba assert en vez de type: "json".
// import users from "./users.json" with { type: "json" };
import fs from "fs";

const jsonData = fs.readFileSync("./users.json", "utf-8");
const users = JSON.parse(jsonData);


// for (const user of users) {
//     if (user.username === "Antonette") {
//         user.username = "Antonieta";
//     }
// }

//lo mismo con un array.map()

// const mapedUsers = users.map(user => {
//     if (user.username === "Anto") {
//         return { username: "Antonette" };
//     }
//     return user;
// });

// Igual, con un ternario

const mapedUsers = users.map(user => user.username === "Anto" ? { ...user, username: "Antonette" } : user);


const updatedJSON = JSON.stringify(mapedUsers, null, 2);
fs.writeFileSync("./users.json", updatedJSON, "utf-8");

console.log("Archivo JSON actualizado con éxito.");



