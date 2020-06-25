const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../../middlewares/auth");

const user = require ("../../models/User");
const User = require("../../models/User");


//Ruta GET Users
//privada
router.get("/", (req, res) => {
    user.find()
        .sort({date: -1})
        .then(users => res.json(users))
});


//Ruta POST Users/auth
//Acceso de usuarios
//privada
router.post("/auth", (req, res) => {

    const { email, password } = req.body;

    //Validacion de datos disponibles
    if( !email || !password ){
        return res.status(400).json({ msg: "Rellene todos los valores"})
    }

    //Validacion de Email debe ser campo unico
    User.findOne({ email })
        .then(user => {
            if(!user) return res.status(400).json({msg: "Usuario no existe"})

            //Validar password
    bcrypt.compare(password, user.password)
    .then(isMatch => {
        if(!isMatch) return res.status(400).json("Contraseña incorrecta");

        jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: 3600},
            (err, token) => {
                if(err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        token: token,
                        username: user.username,
                        email: user.email
                }
            })
            }
        )
        })

    
        })
    
});


//Ruta GET auth/user
// Obtener informacion del usuario.
//Privada

router.get("/user", auth, (req, res) => {
    user.findById(req.user.id)
        .select("-password")
        .then(user => res.json(user));
});


module.exports = router;