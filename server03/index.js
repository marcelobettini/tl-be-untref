const express = require('express');
const data = require("../server02/recipes.json");
const server = express();
server.disable("x-powered-by");
const PORT = process.env.PORT || 3000;

server.get("/", (req, res) => {
    res.send("Bienvenidos a la API de Recetas, con Express JS");
});
server.get("/about", (req, res) => {
    res.send("About Page");
});

server.get("/recipes", (req, res) => {
    res.send(data.recipes);
});
server.get("/recipes/search", (req, res) => {
    const name = req.query?.name || null;
    const ingredient = req.query?.ingredient || null;
    let filteredResults = data.recipes;
    if (name) {
        filteredResults = filteredResults.filter(r => r.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (ingredient) {
        filteredResults = filteredResults.filter(r => r.ingredients.some(i => i.toLowerCase().includes(ingredient.toLowerCase())));
    }

    filteredResults.length ? res.send(filteredResults) : res.status(404).json({ status: 404, message: "Recipe Not Found" });
});

//catch all route
server.use((req, res) => {
    res.status(404).json({ status: 404, message: 'Invalid Route' });
});

server.listen(PORT, (err) => {
    console.log(err ? err.message : `Server up: http://localhost:${PORT}`);
});