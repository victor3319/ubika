const {Router} = require("express");
const router = Router();
const fs = require("fs");
const var_const = require("./var_const");
const js = require("./js");
const path = require ("path");
const multer = require("multer");
const pdf = require("pdf-parse-new");
const session = require('express-session');
const crypto = require("crypto");


//MODELOS IMPORTADOS
const usuarioEnUsoDB = require("../modelos/usuarioEnUso");
const usuariosDB = require("../modelos/usuarios");
//const solicitudesEmpleoDB = require("../modelos/solicitudesEmpleo")
//const busquedasDB = require("../modelos/busquedas")
const console = require("console");
const { ClientEncryption } = require("mongodb");
const { isArray } = require("util");

//leer pdf
/*const dataBuffer = fs.readFileSync('./uploads/recibos/archivo-.pdf');
pdf(dataBuffer).then(function(datos){
    console.log(datos.text)
})
// Número de páginas console.log ( datos.text ) ; // Contenido de texto completo console.log ( datos.info ) ; // Metadatos del PDF } ) ;)})
*/

//var usuarioNavegacion = ""
var listaResponsabilidades = []
var cargos = []

//Configurar almacenamiento
        const storage = multer.diskStorage({
            destination: 'uploads/recibos',
            filename: (req, file, cb) => {
                //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = path.extname(file.originalname);
                cb(null, file.fieldname + '-' + ext);
            }
        });

        const upload = multer({ storage });


//MIDDLEWARE

// Para validar un unico logeo por Usuario
async function validarSesion(req, res, next){
    console.log("ENTRE AL MIDDLEWARE");
    if(!req.session.usuario){
        return res.redirect("/");
    }
    const usuario = await usuariosDB.findById(
        req.session.usuario._id);

        if(!usuario || usuario.sessionToken !== req.session.sessionToken){
            req.session.destroy(() => {});
            return res.redirect("/");
        }
        next();
}

//RUTAS DEL PROGRAMA

router.get("/", (req, res, next) =>{
    res.render("index.pug")
    next()
})

router.get("/home", validarSesion, async(req, res, next) =>{
     if(!req.session.usuario){
        return res.redirect('/');
    }
    else{
        res.render("home.pug",{
            h1: req.session.usuario.nombre,
            accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
        })
    }
    next()
})

router.get("/procesos", validarSesion, async(req, res, next) =>{
    if(!req.session.usuario){
        return res.redirect('/');
    }
    else{
        const usuarioEnUso = await usuarioEnUsoDB.find()
        var proceso = req.body.proceso
        res.render("procesos.pug",{
            //h1 : usuarioNavegacion.nombre, 
            //accesos: Object.keys(usuarioNavegacion.accesos[0]).splice(1)
            h1: req.session.usuario.nombre,
            accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
        })
    }
    next()
})

router.post("/new-entry", async (req, res)=>{   
    const usuarios = await usuariosDB.find()
    
    var datos = req.body
    var boton = req.body.boton

    
    if(boton == "olvidar"){
        res.render("index.pug", {olvidar : js.mostrar()})
    }else{
        var validacion = js.validacionUsuario(datos, usuarios);
        console.log(validacion)
        if(validacion[0] == true){
            var usuariobase = (usuarios.filter(usuario => usuario.contacto === validacion[2]))[0]
            const sessionToken = crypto.randomUUID();
            await usuariosDB.updateOne(
                { _id: usuariobase._id },
                {$set: {
                    sessionToken: sessionToken
                    }
                }
            );
            req.session.usuario = usuariobase
            req.session.sessionToken = sessionToken;
            req.session.save(err => {
                if (err) {
                    console.log(err);
                    return res.redirect("/");
                }
                res.render("home.pug", {
                    h1: req.session.usuario.nombre,
                    accesos: Object.keys(req.session.usuario.accesos[0]).splice(1)
                });
            });
        }
        else{
            res.render("index.pug", {mostrar : js.mostrar()})
        }       
    }
})


//RUTAS ADP
router.post("/adp", validarSesion, upload.single('archivo'), (req, res, next)=>{
    if(!req.session.usuario){
        return res.redirect('/');
    }else{   
        var boton = req.body.boton  
        if(boton == "recibos" || boton == "cerrarR"){
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "recibos"
            })
        }
        if(boton == "cargarRecibos"){
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: boton,
                recibos : js.mostrar()
            })
        }

        //Registrar Recibos
        if(boton == "cargar"){
            const {legajo, mes, ano, archivo} = req.body;
            if(legajo =="" || mes=="" || ano=="" || archivo==""){
                res.render("procesosEspecificos.pug", {
                    h1: req.session.usuario.nombre,
                    accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                    proceso: boton, 
                    completar : js.mostrar()
                })
            }else{            
                    res.render("procesosEspecificos.pug", {
                        h1: req.session.usuario.nombre,
                        accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                        proceso: boton
                    })    
            
                    var recibosJson = fs.readFileSync("archivos/bases/recibos.json", "utf-8");
                    var recibos = JSON.parse(recibosJson)
                    var newRecibo = {
                            legajo,
                            mes,
                            ano,
                            archivo
                        }
                    newRecibo.autor = var_const.usuarioEnUso[1]
                    var base64String = fs.readFileSync('./uploads/recibos/archivo-.pdf', {encoding: "base64"})
                    newRecibo.archivo = base64String
                    recibos.push(newRecibo)
                    var jsonRecibo = JSON.stringify(recibos);
                
                    fs.writeFileSync("archivos/bases/recibos.json", jsonRecibo, "utf-8");
                    
                }   
        }
        
        //Cruce de Novedades
        if(boton == "novedades" || boton == "cerrarN"){
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: boton
            })
        }
        if(boton == "cruce"){
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: boton,
                cruce : js.mostrar() 
            })
        }

        /*if(boton == "vacaciones"){
            res.render("procesos.pug", {
                h1 : var_const.usuarioEnUso[0], 
                accesos: var_const.usuarioEnUso[2], 
                masivas : js.mostrar()
            })       
        }*/
    }    
    next()
    
})

//RUTAS EXTERNAS

router.get("/externo", async (req, res) => {
    var busquedasActivas = await busquedasDB.find({ estatus: "Activa" })
    res.render("procesosExternos.pug", {
        proceso: "solicitud",
        busquedasActivas: busquedasActivas
    })
});
router.post("/externo", upload.single('archivo'), async(req, res, next)=>{
    var boton = req.body.boton
    var datos = req.body
    var cv = req.file
    var solicitudesEmpleo = await solicitudesEmpleoDB.find()
    var busquedasActivas = await busquedasDB.find({ estatus: "Activa" })
    
    
    //SOLICITUD DE EMPLEO
    if(boton == "solicitud" || boton == "cerrar"){        
        res.render("procesosExternos.pug", {
            proceso: "solicitud",
            busquedasActivas: busquedasActivas
        })
    }

    if(boton == "postular"){
        const {nombres, apellidos, telefono, email, carrera, sueldo, archivo} = req.body;
        //VALIDADION DE DATOS OBLIGATORIOS
        if(
            nombres =="" || 
            apellidos =="" || 
            telefono =="" || 
            email =="" || 
            carrera =="" || 
            sueldo =="" || 
            archivo ==""){
            res.render("procesosExternos.pug", {
                proceso: "solicitud",
                completar: js.mostrar(),
                busquedasActivas: busquedasActivas
            })  
        }
        //VALIDACION DE ARCHIVO PDF
        if(js.pdfA(cv)== false || cv ==undefined){
            res.render("procesosExternos.pug", {
                proceso: "solicitud",
                pdf: js.mostrar(),
                busquedasActivas: busquedasActivas
            })  
        }
        // VALIDACIONN DE REGISTRO
        if(js.validarRegistro(datos, solicitudesEmpleo)== true){
            res.render("procesosExternos.pug", {
                proceso: "solicitud",
                registro: js.mostrar(),
                busquedasActivas: busquedasActivas
            })
        // REGISTRAR SOLICITUD  
        }else if(nombres !="" && apellidos !="" && telefono !="" && email !="" && carrera !="" && sueldo !="" && archivo !=""){
            var cargoArray = js.variosTiposDatos(datos.cargo)
            var nuevaSolicitud = await js.solicitud(datos)
            nuevaSolicitud.cargo = cargoArray
            console.log(nuevaSolicitud)
            await solicitudesEmpleoDB.create(nuevaSolicitud);
            res.render("procesosExternos.pug", {
                proceso: "solicitud",
                exito: js.mostrar(),
                busquedasActivas: busquedasActivas
            })  
        }
        
    }



    //FICHADA
    if(boton == "fichaje"){
        res.render("procesosExternos.pug", {
            proceso: boton
        })
    }


})


//RUTAS EMPLEO Y DESARROLLO
router.post("/e&d", validarSesion, upload.single('archivo'), async(req, res, next)=>{
    if(!req.session.usuario){
        return res.redirect('/');
    }else{ 
        var boton = req.body.boton
        var solicitudesEmpleo = await solicitudesEmpleoDB.find()
        var busquedas = await busquedasDB.find()
        var codigoBusqueda = js.codigo(busquedas)
    
        if(boton == "seleccion" || boton == "cerrarS"){
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "seleccion",
                listaResponsabilidades,
                cargos,
                base1 : solicitudesEmpleo,
                tBusquedas : busquedas
                //formData: req.body,
            })
        }


        //TABLA DE SOLICITUDES
        var datosBoton = req.body.boton.split("-")
        var boton = datosBoton[0]
        var registro = datosBoton[1]
        if(boton == "solicitudes"){
            var base = solicitudesEmpleo
            res.render("procesosEspecificos.pug",{
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "seleccion",
                solicitudes : js.mostrarOcultarContenido(),
                listaResponsabilidades,
                cargos,
                tBusquedas : busquedas,
                base1 : base
                })
        }else if(boton == "eliminar"){
            var base = solicitudesEmpleo
            await solicitudesEmpleoDB.deleteOne({correo: registro});
            var borrado = await solicitudesEmpleoDB.find()
            res.render("procesosEspecificos.pug",{
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "seleccion",
                solicitudes : js.mostrarOcultarContenido(),
                tBusquedas : busquedas,
                listaResponsabilidades, 
                cargos,
                base1 : borrado
            })
        }else if(boton == "cv"){
            res.setHeader('Content-Type', 'application/pdf');
            res.send(js.mostrarArchivo(datosBoton[1], solicitudesEmpleo))
        }
        //Filtrar Por datos del CV
        else if(boton == "fCv1"){
            var textoBuscado = req.body.filtrocv1
            var base = await solicitudesEmpleoDB.find({texto:{$regex: textoBuscado, $options: "i"}})
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "seleccion",
                solicitudes : js.mostrarOcultarContenido(),
                cargos,
                tBusquedas : busquedas,
                listaResponsabilidades,
                base1 : base
                })
        }
        //Filtrar por Cargos/Plantas
        else if(boton == "fCargos"){
            var textoBuscado = req.body.filtroCargos
            var base = await solicitudesEmpleoDB.find({cargo:{$regex: textoBuscado, $options: "i"}})
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "seleccion",
                solicitudes : js.mostrarOcultarContenido(),
                cargos,
                tBusquedas : busquedas,
                listaResponsabilidades,
                base1 : base
                })
        }
       //EDITAR SOLICITUD
        else if(boton == "editarSolicitud"){
            var regitroAEditar = await solicitudesEmpleoDB.find({ correo: registro });
            cargos = js.variosTiposDatos(regitroAEditar[0].cargo)
            console.log(cargos)
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "seleccion",
                solicitudes : js.mostrarOcultarContenido(),
                editarSolicitud : js.mostrar(),
                tBusquedas : busquedas,
                listaResponsabilidades,
                cargos,
                formData: regitroAEditar[0],
                base1 : solicitudesEmpleo
            })          
        }
        //AGREGAR CARGOS A SOLICITUD
        else if(boton == "agregarCargo"){
            var cargoAgregado = req.body.cargoAgregado?.trim();
            if(cargoAgregado){
                cargos.push(cargoAgregado)
            }
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "seleccion",
                solicitudes : js.mostrarOcultarContenido(),
                editarSolicitud : js.mostrar(),
                tBusquedas : busquedas,
                listaResponsabilidades,
                cargos,
                formData : req.body,
                base1 : solicitudesEmpleo
            })
        }
        //ELIMINAR CARGOS DE SOLICITUD
        else if(boton == "eliminarC"){
            cargos.splice(registro, 1)
            cargos = js.variosTiposDatos(cargos)
            console.log(cargos)
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "seleccion",
                solicitudes : js.mostrarOcultarContenido(),
                editarSolicitud : js.mostrar(),
                tBusquedas : busquedas,
                listaResponsabilidades,
                cargos,
                formData : req.body,
                base1 : solicitudesEmpleo
            })
        }
        //REGISTRAR EN BD MODIFICACIONES DE SOLICITUD
        else if(boton == "modificarS"){
            const {nombres, apellidos, telefono, correo, linkedIn, carrera, cargo, estatus, fechaProceso, proceso, resultado} = req.body
            var enProceso = js.armadorProcesoSeleccion(fechaProceso, proceso, resultado)
            var nuevosDatos = {nombres, apellidos, telefono, correo, linkedIn, carrera, cargo, estatus, enProceso}
            var solicitudAModificarr = await solicitudesEmpleoDB.updateOne(
                { correo: correo },
                { $set:{
                    nombres,
                    apellidos,
                    cargo,
                    telefono,
                    correo,
                    linkedIn,
                    carrera, 
                    cargo,
                    enProceso,
                    estatus,
                }
                }
            );
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "seleccion",
                solicitudes : js.mostrarOcultarContenido(),
                tBusquedas : busquedas,
                listaResponsabilidades,
                cargos,
                base1 : solicitudesEmpleo
            })
        }



        //TABLA BUSQUEDAS
        if(boton == "busquedas"){
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "seleccion",
                pBusquedas : js.mostrarOcultarContenido(),
                tBusquedas : busquedas,
                listaResponsabilidades,
                cargos,
                base1 : solicitudesEmpleo
            })
        }else if(boton == "nuevaBusqueda" || boton == "cerrarB"){
            listaResponsabilidades = []
            console.log(codigoBusqueda)
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "seleccion",
                pBusquedas : js.mostrarOcultarContenido(),
                agregarBusqueda : js.mostrar(),
                tBusquedas : busquedas,
                codigoBusqueda,
                listaResponsabilidades,
                cargos,
                base1 : solicitudesEmpleo
            })
        }else if(boton == "agregarResponsabilidad"){
            var bodyLimpio = js.normalizarBody(req.body)
            var nuevaResponsabilidad = bodyLimpio.responsabilidadAgregada?.trim();
            console.log("123")
            if(nuevaResponsabilidad){
                listaResponsabilidades.push(nuevaResponsabilidad)
            }
                res.render("procesosEspecificos.pug", {
                    h1: req.session.usuario.nombre,
                    accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                    proceso: "seleccion",
                    pBusquedas : js.mostrarOcultarContenido(),
                    agregarBusqueda : js.mostrar(),
                    tBusquedas : busquedas,
                    listaResponsabilidades,
                    cargos,
                    formData: req.body,
                    codigoBusqueda,
                    base1 : solicitudesEmpleo
                })
        }else if(boton == "editarResponsabilidades"){            
            //var bodyLimpio = js.normalizarBody(req.body);
            var editarResponsabilidad = req.body.responsabilidadEditada?.trim();
            if(editarResponsabilidad){
                listaResponsabilidades.push(editarResponsabilidad)
            }
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "seleccion",
                pBusquedas : js.mostrarOcultarContenido(),
                editarBusqueda : js.mostrar(),
                tBusquedas : busquedas,
                listaResponsabilidades,
                cargos,
                formData: req.body,
                base1 : solicitudesEmpleo
            })
        }else if(boton == "eliminarR"){
            var bodyLimpio = js.normalizarBody(req.body);
            listaResponsabilidades.splice(registro, 1)
    
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "seleccion",
                pBusquedas : js.mostrarOcultarContenido(),
                editarBusqueda : js.mostrar(),
                tBusquedas : busquedas,
                listaResponsabilidades,
                cargos,
                formData: bodyLimpio,
                base1 : solicitudesEmpleo
            })
        }  
        
        else if(boton == "cargarB"){
            
            const {codigo, cargo, tipo, cliente, correoCliente, lTrabajo, fInicioBusqueda} = req.body;
            var nuevaBusqueda = {
                codigo,
                cargo,
                tipo,
                cliente,
                correoCliente,
                estatus : "Activa",
                lTrabajo,
                fInicioBusqueda,
                listaResponsabilidades
            }
            await busquedasDB.create(nuevaBusqueda);
            listaResponsabilidades = []
             res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "seleccion",
                pBusquedas : js.mostrarOcultarContenido(),
                tBusquedas : busquedas,
                listaResponsabilidades,
                cargos,
                base1 : solicitudesEmpleo
            })
        }else if(boton == "editarB"){
            var regitroAEditar = await busquedasDB.find({ codigo: registro });
            listaResponsabilidades = regitroAEditar[0].listaResponsabilidades || []
           
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "seleccion",
                pBusquedas : js.mostrarOcultarContenido(),
                editarBusqueda : js.mostrar(),
                tBusquedas : busquedas,
                listaResponsabilidades,
                cargos,
                formData: regitroAEditar[0],
                base1 : solicitudesEmpleo
            })
        
        }else if(boton == "modificarB"){
            var registro = req.body.codigo
            const {codigo, tipo, cargo, cliente, correoCliente, lTrabajo, fInicioBusqueda, listaResponsabilidades, estatus} = req.body;
            
            var regitroAModificar = await busquedasDB.updateOne(
                { codigo: registro },
                { $set:{
                    codigo: codigo,
                    tipo: tipo,
                    cargo: cargo,
                    cliente: cliente,
                    correoCliente: correoCliente,
                    lTrabajo: lTrabajo,
                    fInicioBusqueda: fInicioBusqueda,
                    listaResponsabilidades: listaResponsabilidades,
                    estatus: estatus,
                }
                }
            );
           
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "seleccion",
                pBusquedas : js.mostrarOcultarContenido(),
                tBusquedas : busquedas,
                listaResponsabilidades,
                cargos,
                formData: regitroAModificar[0],
                base1 : solicitudesEmpleo
            })
        
        }else if(boton == "eliminarB"){
            await busquedasDB.deleteOne({codigo: registro});
            var busquedas = await busquedasDB.find()
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: "seleccion",
                pBusquedas : js.mostrarOcultarContenido(),
                tBusquedas : busquedas,
                listaResponsabilidades,
                cargos,
                base1 : solicitudesEmpleo
            })
        }
        
    }
     next()
})

//RUTAS DE ADMINISTRADOR
router.post("/administrador", validarSesion, upload.single('archivo'), (req, res, next)=>{
    if(!req.session.usuario){
        return res.redirect('/');
    }else{ 
        var boton = req.body.boton
        var proceso = req.body.proceso
        var subProceso = req.body.subProceso
        if(boton == "descargas"){
            res.render("procesos.pug",{
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                subProcesos : js.listadoSecundario(var_const.procesos, proceso), 
                descargas : js.mostrar()
            })
        }
        if(boton == "procesos" && proceso == "accesos"){
            res.render("procesos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                subProcesos : js.listadoSecundario(var_const.procesos, proceso), 
                completar : js.mostrar()
            })
        }

        if(boton == "procesos" && proceso != "accesos"){
            res.render("procesos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                subProcesos : js.listadoSecundario(var_const.procesos, proceso),
                descargas2 : js.mostrar()
            })
        }

        if(boton == "subProcesos" && subProceso == "subProcesos"){
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                subProcesos : js.listadoSecundario(var_const.procesos, proceso)
            })
        }
    }
})

//RUTA VOLVER DE PROCESOS ESPECIFICOS
router.post("/procesosEspecificos", validarSesion, upload.single('archivo'), (req, res, next)=>{
    if(!req.session.usuario){
        return res.redirect('/');
    }else{ 
        var boton = req.body.boton
        if(boton == "cargarRecibos"){
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: boton
                //recibos : js.mostrar()
            })
        }

        if(boton == "novedades"){
            res.render("procesosEspecificos.pug", {
                h1: req.session.usuario.nombre,
                accesos: Object.keys(req.session.usuario.accesos[0]).splice(1),
                proceso: boton 
                //cruce : js.mostrar()
            })
        }
    }
})





module.exports = router
