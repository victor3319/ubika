const mongoose = require("mongoose");

//ESQUEMA
const usuarioEnUsoEsquema = new mongoose.Schema({
    nombre:{
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
        type:String,
        required: true
    },
    accesos: [{
            publicador : {type: mongoose.Schema.Types.Mixed},
            marketin : {type: mongoose.Schema.Types.Mixed},
            desarrollo : {type: mongoose.Schema.Types.Mixed}
        }]
})

const usuariorEnUsoModelo = new mongoose.model("usuarioEnUso", usuarioEnUsoEsquema)

module.exports = usuariorEnUsoModelo