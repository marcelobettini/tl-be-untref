async function getData(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error en la response. Información no encontrada");
        const data = await res.json();
        return data;
    } catch (err) {
        console.log(err.message);
    } finally {
        console.log("Esto corre siempre");
    }
}
// top level 

const users = await getData('https://jsonplaceholder.typicode.com/users/3');
console.log(users);


