const mongoose = require("mongoose");
const formidable = require("formidable");
const fs = require("fs");

const job = require ("../../models/Job");
const category = require ("../../models/Category");

exports.findJobs = function(req, res) {
    job.find()
        .populate("category", "tipo")
        .sort({date: -1})
        .then(jobs => res.json(jobs));
};


exports.findCategoryJobs = function(req, res, categ) {

    //Buscar todas las categorias disponibles
    category.find({}, (err,categories) => {

        const catDetails = categories.find(category => {
            return category.tipo == categ;

        });

        //De no encontrar la categoria en base de dato enviar respuesta de invalido
        if(typeof catDetails == "undefined") res.send("Categoria no encontrada"); 
        else
        {
            job.find({category: catDetails._id})
            .populate("category", "tipo")
            .sort({date: -1})
            .then(jobs => res.json(jobs));
        }
        
    });
};

exports.findIdJob = function(req, res, id) {

    job.findById(id)
        .populate("category", "tipo")
        .then(job => res.json(job));
};

exports.postJobs= function(req, res) {

    const form = formidable({ keepExtensions: true });

    //Peticiones a esta ruta deben estar encoded como multipart/form-data
    form.parse(req, (err, fields, files) => {

        if (err) return res.send(err);

        const {company, type, url, position, location, description, compemail} = fields;

        if(!company || !type || !position || !location) return res.send("Complete los campos requeridos");

        const file = files.logo;
        
        if(file !== undefined){
        
            //Mover el archivo  al path public/logos
            fs.rename(file.path, "public/logos/" + file.name, function (err) {
                if (err) return res.send(err);
                console.log('Path cambiado');
            });
            }
        

        //Buscar categorias
        category.find({}, (err,categories) => {

            //Obtener detalles de categoria a la que pertenece el job
            const catDetails = categories.find(category => {
                return category.tipo == fields.category;

            });

            //De no encontrar la categoria enviar respuesta
            if(typeof catDetails == "undefined") return res.send("Categoria no encontrada"); 

            const newJob = new Job({
                company,
                type,
                url,
                position,
                location,
                description,
                logo: (file !== undefined )?file.name: null,
                compemail,
                category: mongoose.Types.ObjectId(catDetails._id)
            });

            newJob.save().then(job => res.json(job)).catch( err => res.send(err));
            
    });

});
};

exports.deleteJob = function(req, res, id) {

    job.findById(id)
        .then(job => job.remove().then(() => res.json("Job eliminado")))
        .catch(err => res.status(404).json("Job no Eliminado"))
};



exports.editJob = function(req, res, id) {
 
    const form = formidable({ keepExtensions: true });

    //Peticiones a esta ruta deben estar encoded como multipart/form-data
    form.parse(req, (err, fields, files) => {

        if (err)  return res.send(err);

        const {company, type, url, position, location, description, compemail} = fields;

        const file = files.logo;

        if(!company || !type || !position || !location) return res.send("Complete los campos requeridos");

        //Buscar categorias
        category.find({}, (err,categories) => {

            //Obtener detalles de categoria a la que pertenece el job
            const catDetails = categories.find(category => {
                return category.tipo == fields.category;

            });

            //De no encontrar la categoria enviar respuesta
            if(typeof catDetails == "undefined") return res.send("Categoria no encontrada"); 

            if(file !== undefined){
        
                //Mover el archivo  al path public/logos
                fs.rename(file.path, "public/logos/" + file.name, function (err) {
                    if (err) res.send(err);
                    console.log('Imagen modificada con exito');
                });
            }
            
        
                //Buscar al primer documento job que coincida con el id y actualizar
                job.findOneAndUpdate({"_id": id }, 
                                    {
                                        company,
                                        type,
                                        url,
                                        position,
                                        location,
                                        description,
                                        logo: (file !== undefined )?file.name: null,
                                        compemail,
                                        category: mongoose.Types.ObjectId(catDetails._id)
                                    },function(err, doc) {
                if (err) return res.send(500, {error: err});
                
                doc.company = company;
                doc.type = type;
                doc.url = url;
                doc.position = position;
                doc.location = location;
                doc.description = description;
                doc.logo = (file !== undefined )?file.name: null,
                doc.compemail = compemail,
                doc.category = fields.category;
                return res.send(doc);
                });
            
    });
    });
};


exports.searchJob = (req,res, param) => {

    job.find({$or:[{location: param},
                    {company: param},
                    {position: param},
                    {type: param} ]})
        .populate("category", "tipo")
        .sort({date: -1})
        .then(jobs => res.json(jobs));
} 