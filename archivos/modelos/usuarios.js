const mongoose = require("mongoose");

//ESQUEMA
const usuariosEsquema = new mongoose.Schema({
    nombre:{
        type:String,
        required: true
    },
    apellido:{
        type:String,
        required: true
    },
    preferenciaContacto: {
        type:String,
        required: true
    },
    contacto: {
        type:String,
        required: true
    },
    password: {
        type:String,
        required: true
    },
    tipo: {
        type: mongoose.Schema.Types.Mixed
    },
    accesos: [{
        publicador : {type: mongoose.Schema.Types.Mixed},
        marketing : {type: mongoose.Schema.Types.Mixed},
        desarrollo : {type: mongoose.Schema.Types.Mixed}
    }],
    sessionToken:{
        type: mongoose.Schema.Types.Mixed
    },
    comunicaciones :{
        type: mongoose.Schema.Types.Mixed
    }
})

const usuariosModelo = new mongoose.model("usuarios", usuariosEsquema)

module.exports = usuariosModelo