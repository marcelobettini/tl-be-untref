//Si necesitamos hacer varias preguntas para una misma sesión de entrada de datos (por ejemplo datos de un cliente, usuario, producto, etc) necesitamos anidar callbacks -> CALLBACK HELL o PYRAMID OF DOOM
// rl.question('p1', (r1) => {
//     rl.question('p2', (r2) => {
//         rl.question('p3', (r3) => {
//             rl.question('p4', (r4) => {
//                 rl.question('p5', (r5) => {
//                   //recién acá podemos usar r1, r2, r3, r4 y r5
//               })
//           })
//       })  
//     })
// })

// SOLUCIÓN: readline/promises + ASYNC / AWAIT

import { createInterface } from 'node:readline/promises';

async function registerForm() {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('-'.repeat(60));
    console.log('formulario de registro');
    console.log('-'.repeat(60));

    let name;
    do {
        name = (await rl.question("Nombre completo: ")).trim();
        if (!name) {
            console.error(' ⚠ El nombre no puede estar vacío');
        }
    } while (!name);

    let email;
    do {
        email = (await rl.question("Correo Electrónico: ")).trim();
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!isValidEmail) {
            console.error(' ⚠ El email no tiene formato válido');
        }
    } while (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    rl.close();


}

registerForm().catch(console.error);