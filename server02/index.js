import http from 'node:http';
import data from './recipes.json' with {type: "json"};

const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    switch (url.pathname) {
        case "/":
            res.writeHead(200, { "content-type": "text/plain" });
            res.end("Bienvenidos a la API de Recetas");
            break;
        case "/docs":
            res.writeHead(200, { "content-type": "text/html; charset=utf8" });
            res.end("<h1>Aquí va la documentación de la API</h1>");
            break;
        case "/recipes":
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify(data.recipes));
            break;
        case "/recipes/search":
            const name = url.searchParams.get("name");
            const ingredient = url.searchParams.get("ingredient");

            let filteredResults = [...data.recipes];
            if (name) {
                filteredResults = filteredResults.filter(r => r.name.toLowerCase().includes(name.toLowerCase()));
            }
            if (ingredient) {
                filteredResults = filteredResults.filter(r => r.ingredients.some(i => i.toLowerCase().includes(ingredient.toLowerCase())));
            }
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify(filteredResults));
            break;
        default:
            res.writeHead(404, { 'content-type': 'text/plain' });
            res.end("Ruta inexistente");
            break;
    }


});

server.listen(PORT, (err) => {
    console.log(err ? err.message : `Server running on http://localhost:${PORT}`);
});
