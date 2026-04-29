const http = require("node:http");
const PORT = process.env.PORT || 3001;

const server = http.createServer(
    (req, res) => {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Hello, World!");
    }
);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

