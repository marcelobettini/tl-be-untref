import express from 'express';
import jwt from 'jsonwebtoken';
const PORT = process.env.PORT ?? 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION;

const user = {
    id: "2klok_3454-sdf",
    name: "Marcelino Pan y Vino",
    email: "marce@bla.bla",
    password: "1234",
    passwordChangedAt: null,
};

const server = express();
server.use(express.json());

server.get("/api", (req, res) => {
    res.json({ message: "Learning web tokens based sessions" });
});

server.post("/api/login", (req, res, next) => {
    //En una api real validaríamos req.body.email y req.body.password contra la DB.
    const { email, password } = req.body;
    if (email === user.email && password === user.password) {
        jwt.sign(
            { user: { name: user.name, email: user.email } },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION },
            (err, token) => {
                if (err) return next(err);
                res.json({ token });
            }
        );
    } else {
        const err = new Error("Usuario o contraseña incorrectos");
        err.status = 401;
        return next(err);
    }
});


server.post("/api/posts", tokenVerify, (req, res) => {

    res.json({ message: "Se ha creado un recurso" });
});

server.post("/api/change-password", (req, res) => {
    user.password = req.body.password;
    user.passwordChangedAt = new Date();
    res.json({ message: "Contraseña ha cambiado. Ingrese nuevamente." });
});

//middleware de verificación de tokens
function tokenVerify(req, res, next) {
    const authHeader = req.headers["authorization"];


    if (typeof authHeader === "undefined") {
        const err = new Error("Acceso prohibido | Token inexistente");
        err.status = 403;
        return next(err);
    }

    const token = authHeader.split(" ").pop();

    jwt.verify(token, JWT_SECRET, (err, authData) => {
        if (err) {
            const error = new Error("Acceso prohibido | Token no es válido");
            error.status = 403;
            return next(error);
        }

        if (user.passwordChangedAt && authData.iat < user.passwordChangedAt.getTime() / 1000) {
            const error = new Error("Acceso prohibido | Token invalidado por cambio de contraseña");
            error.status = 403;
            return next(error);
        }


    });
    next();

}

server.use((req, res, next) => {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

server.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({
        error: {
            status,
            message: err.message || "Internal Server Error",
        },
    });
});

server.listen(PORT, (err) => {
    err ? console.log(err) : console.log(`Server up http://localhost:${PORT}`);
});