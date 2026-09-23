const { rejects } = require("assert");
const var_const = require("./var_const")
const fs = require("fs")
const pdf = require("pdf-parse-new");
const { response } = require("express");
const { registerHooks } = require("module");
const { basename } = require("path");


//VALIDACION DE USUARIOS

function validacionUsuario(datos, usuarios){
    const existe = usuarios.some(obj =>
        obj.contacto === datos.contacto &&
        obj.password === datos.password
    );
    var datosIngreso = []
    datosIngreso.push(existe, datos.contacto, datos.password)
    return datosIngreso
}

function validarRegistro(datos,registros){
    const existe = registros.some(obj =>
        obj.contacto === datos.conctacto
    );
    return existe
}

//MOSTRAR VENTANA MODAL

function mostrar(){
    var mostrar = ""
    mostrar = "open"
    return mostrar
}


//CONVERTIR DE ARCHIVO A BASE64

function base64(){
    var base64String = fs.readFileSync('./uploads/recibos/archivo-.pdf', {encoding: "base64"})
    return base64String
}

//CONVERTIR DE BASE64 A ARCHIVO

function mostrarArchivo(registro, registros){
    var registroBuscado = registros.filter(item => item.correo == registro)
    var base64 = registroBuscado[0].archivo
    var buffer = Buffer.from(base64, 'base64');
    
    return buffer
}

//EXTRAER TEXTO PDF

function textoPdf(){
    
    const dataBuffer = fs.readFileSync('./uploads/recibos/archivo-.pdf');
    var letras = pdf(dataBuffer).then((datos)=> letras = datos.text)
    
    return letras
        
    // Número de páginas console.log ( datos.text ) ; // Contenido de texto completo console.log ( datos.info ) ; // Metadatos del PDF } ) ;)})
    
    }

//CAMBIO DE CONTRASEÑA
function cambioPassword(datos, usuarios){
    var nombres = []
    var correos = []
    //var passwords = []
    var datosNombre = datos.nombreC
    var datosCorreo = datos.correoC
    var datosPassword = datos.passwordC

    usuarios.map((item) => nombres.push(item.nombre))
    usuarios.map((item) => correos.push(item.correo))
    //usuarios.map((item) => passwords.push(item.password))
    

    var valNombre = nombres.includes(datosNombre)
    var valCorreo = correos.includes(datosCorreo)
    //var valPassword = passwords.includes(datosPassword)

    if(valNombre == true && valCorreo == true /*&& valPassword == true*/){
        return true
        
    }else{
        return false
    }
}

//LISTADO SECUNDARIO
function listadoSecundario(base, dato){
    var datos = base[0]
    var lista = []
    for(const elemento in datos){
        lista.push(Object.values(datos))
    };
    console.log(datos)
    console.log(lista)
    return dato
}


//MOSTRAR Y OCULTAR CONTENIDO DIV
function mostrarOcultarContenido(){
    var contenido = "block"
   return contenido
}

//ACCIONES EN TABLAS

function filtrarTabla(datos, registros){
    console.log(datos)
    //var base = JSON.parse(fs.readFileSync(rutaRegistros, "utf-8"));
    var array = datos.split(" ")

    var resultados = registros.filter(registro => {
    // Convierte a minúsculas para búsqueda insensible a mayúsculas
    const nombreMinusculas = registro.texto.toLowerCase();
    
    // Verifica si alguna palabra clave está incluida en el nombre
    return array.some(palabra => 
        nombreMinusculas.includes(palabra.toLowerCase())
    );
});

return resultados
    
}


//EXTERNO
function pdfA(archivo){
    if(archivo == undefined){
        return false
    }else{
        var nomArchivo = archivo.originalname
        var extArchivo = String(nomArchivo).split(".").pop()
        
        if(extArchivo != "pdf"){
            return false
        }
    }
}

function registrar(datos, ruta){
    var base = JSON.parse(fs.readFileSync(ruta, "utf-8"));
    base.push(datos)
    var nuevaBase = JSON.stringify(base)
    fs.writeFileSync(ruta, nuevaBase, "utf-8");
}

async function solicitud(datos){
    delete datos.boton
    var base = await base64()
    var texto = await textoPdf()
    datos.texto = texto
    datos.archivo = base
    return datos
}

function codigo(datos){
     if (!datos.length) {
        return 1
    }
    var codigos = datos.map(dato => Number(dato.codigo))
    var nuevoCodigo = Math.max(...codigos) + 1
    
    return nuevoCodigo
}

function armadorProcesoSeleccion(fechaProceso, proceso, resultado){
    var arrays = [fechaProceso, proceso, resultado]
    var arraysValidos = arrays.filter(arr => Array.isArray(arr));
    var completos = Number.isInteger(arraysValidos.length / 3) && arraysValidos.length / 3 > 0
    /*var largoArray1 = fechaProceso.length || ""
    var largoArray2 = proceso.length || ""
    var largoArray3 = resultado.length || ""
    var mismoLargo = largoArray1 === largoArray2 && largoArray2 === largoArray3*/    
    console.log(completos)
    var enProceso = {}

    if(completos == true){
        for (let i = 0; i < proceso.length; i++) {
            const clave = proceso[i];
            enProceso[clave] = [fechaProceso[i], resultado[i]];
  }
    }
    
    return enProceso
}


function normalizarBody(body) {
   
    const bodyLimpio = {};

    for (const clave in body) {
        if (Array.isArray(body[clave])) {

            const valores = body[clave].filter(v => v !== "");

            bodyLimpio[clave] = valores.length ? valores[0] : "";
        } else {
            bodyLimpio[clave] = body[clave];
        }
    }

    return bodyLimpio;
}

//Para manejar distintos datos Array y String

function variosTiposDatos(datos){
    var datosDevueltos = ""
    if(Array. isArray(datos)){
        datosDevueltos = datos
    }else if(typeof(datos) === "string"){
        datosDevueltos = [datos]
    }
    return datosDevueltos
}




module.exports = {
    mostrar : mostrar,
    cambioPassword : cambioPassword,
    listadoSecundario : listadoSecundario,
    textoPdf : textoPdf,
    base64 : base64,
    pdfA : pdfA,
    validarRegistro : validarRegistro,
    solicitud : solicitud,
    registrar : registrar,
    mostrarOcultarContenido : mostrarOcultarContenido,
    mostrarArchivo : mostrarArchivo,
    filtrarTabla : filtrarTabla,
    validacionUsuario : validacionUsuario,
    codigo : codigo,
    normalizarBody : normalizarBody,
    armadorProcesoSeleccion : armadorProcesoSeleccion,
    variosTiposDatos : variosTiposDatos,
}