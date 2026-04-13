import readline from 'node:readline';

// Crear una interfaz de entrada / salida

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


rl.question('Años de experiencia en IT: ', (years) => {
    //number as a string -> number
    const yearsNumber = Number(years);
    if (isNaN(yearsNumber)) {
        console.error('\nNo es un número válido');
    }
    rl.close();
});



