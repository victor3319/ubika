const express = require('express');
const dotenv = require("dotenv");
dotenv.config()
const fs = require("fs");
const path = require ("path");
const morgan = require("morgan");
const pdf = require("pdf-parse-new")
const mongoose = require('mongoose');
const session = require('express-session');
const app = express();

async function conectarDB() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
}

conectarDB();

const statics = path.join(__dirname,"archivos")

//Configuración de Puerto
const PORT = process.env.PORT || 3000;

//app.set("port", process.env.PORT || 5000)

//express vistas
app.set("views", path.join(__dirname,"./archivos/vistas"))
app.set("view engine", "pug")

//express para leer json

app.use(morgan("dev"))
app.use(express.urlencoded({extended: true}));
app.use(express.json());

//Para Adminitrar Seciones de Usuarios Distintas
app.use(session({
    secret: process.env.SESSION_SECRET || 'clave-secreta',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true
    }
  }
));


//express para leer rutas

app.use(require("./archivos/funciones_rutas/index"))
app.use(require("./archivos/funciones_rutas/comex"))

app.use(express.static(statics))

// 404 handler

app.use((req, res, next) =>{
     res.render("enConstruccion.pug")
})

//express bases
app.set("bases", path.join(__dirname,"./archivos/bases"))


//Parsear Datos de Formulario
//app.use(express.urlencoded({ extended: true }));

//Escucha del Servidor
app.listen(PORT, () => {
     console.log(`Servidor escuchando en http://localhost:${PORT}`)
});





module.exports = app



