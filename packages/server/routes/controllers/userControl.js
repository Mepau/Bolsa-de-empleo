const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const user = require ("../../models/User");

exports.register = function(req, res) {

    
    const { email, password, username, rol } = req.body;

    //Validacion de datos disponibles
    if( !email || !password || !username){
        return res.status(400).json({ msg: "Rellene todos los valores"})
    }

    //Validacion de Email debe ser campo unico
    user.findOne({ email })
        .then(user => {
            if(user) return res.status(400).json({msg: "Usuario ya existe"})
        })

    const newUser = new User({
        username,
        email,
        password,
        rol
    });

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err,hash) => {
            if(err) throw err;
            newUser.password = hash;
            newUser.save().then(user =>
                
                jwt.sign(
                    { id: user.id, rol: user.rol },
                    process.env.JWT_SECRET,
                    { expiresIn: 3600},
                    (err, token) => {
                        if(err) throw err;
                        res.json({
                            token,
                            user: {
                                id: user.id,
                                username: user.username,
                                email: user.email,
                                rol: user.rol
                        }
                    })
                    }
                )
                ).catch( err => res.send(err));
        })
    })
};

exports.login = function(req, res) {

    const { email, password } = req.body;

    //Validacion de datos disponibles
    if( !email || !password ){
        return res.status(400).json({ msg: "Rellene todos los valores"})
    }

    //Validacion de Email debe ser campo unico
    user.findOne({ email })
        .then(user => {
            if(!user) return res.status(400).json({msg: "Usuario no existe"})

            //Validar password
    bcrypt.compare(password, user.password)
    .then(isMatch => {
        if(!isMatch) return res.status(400).json("Contraseña incorrecta");

        jwt.sign(
            { id: user.id, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: 3600},
            (err, token) => {
                if(err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        rol: user.rol
                }
            })
            }
        )
        }).catch( err => res.send(err));
        })
};


exports.getInfo = function(req, res) {
    user.findById(req.user.id)
        .select("-password")
        .then(user => res.json(user));
    
};