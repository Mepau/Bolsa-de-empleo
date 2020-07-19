const category = require ("../../models/Category");

exports.findCategories = function(req, res) {

    //Buscar todas las categorias registradas
    category.find()
        .then(categories => res.json(categories))
};


exports.postCategory = function(req, res) {

    const newCategory = new Category({
        tipo: req.body.tipo
    });
    
    //Revisar para duplicados
    category.find({tipo: newCategory.tipo}, (err,docs) =>{
        if(err) throw err;

        //De no encontrar duplicados proceder a guardar
        if(docs == 0) newCategory.save().then(category => res.json(category)).catch( err => res.send(err));

        //De encontrarlo proceder a reportarlo y no se agrega.
        else return res.json("Categoria duplicada")
    });
};

exports.deleteCategory = function(req, res, tipo) {
 
    //Buscar la categoria sgeun el key tipo y eliminar
    category.find({tipo})
        .deleteOne(() => res.json("Categoria eliminada"))
        .catch(err => res.status(404).json("Categoria no Eliminada"))
};


exports.editCategory = function(req, res, tipo) {
 
    //Buscar al primer documento category que coincida con el campo tipo y actualizar
    category.findOneAndUpdate({"tipo": tipo }, { tipo: req.body.tipo }, (err, doc) => {
        if (err) return res.send(500, {error: err});

        doc.tipo = req.body.tipo;
        return res.send(doc);
        });
};