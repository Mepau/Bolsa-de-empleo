const express = require("express");
const user_controller = require("../controllers/userControl");
const router = express.Router();


//Ruta GET Users
/*router.get("/", (req, res) => {
    user.find()
        .sort({date: -1})
        .then(users => res.json(users))
});*/

//Ruta POST Users
//Registro de usuarios
router.post("/", (req, res) => {

    user_controller.register(req,res);
});



router.post("/login/",(req,res)=>{
    user_controller.login(req,res);
});


module.exports = router;