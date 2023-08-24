const bcrypt = require("bcrypt")
const { UserModel } = require('../db/sequelize')
const { UniqueConstraintError, ValidationError } = require("sequelize")
const { sendMailRegistration } = require("../utils/sendMail")
const jwt = require("jsonwebtoken")
const privateKey = require("../setting/privateKey")

/*********************************************************
CREATE (SIGNUP : inscription)
- crée et retourne un utilisateur
*********************************************************/
exports.signUp = (req, res) => {
    bcrypt.hash(req.body.password,10)
    .then((hash) => {
        req.body.password = hash
        UserModel.create(req.body)
            .then((element) => {
                const token = jwt.sign(
                    { data: element.id }, // Génération du token avec encryptage de l'id user
                    privateKey,
                    { expiresIn: "300000" })

                const url = "http://localhost:3000/inscription-confirm/" + token
                sendMailRegistration(element.email, "Inscription site LudicZone", req.body.nick_name, url)
                    .then((info) => {
                        const  msg = `Un mail de validation de la création du compte a été envoyé à l'adresse : '${info.accepted[0]}'.`
                        return res.status(200).json({ status: "SUCCESS", message: msg })
                    })
                    .catch((error) => {
                        throw Error(error);
                    })
            })
            .catch(error => {
                if(error instanceof UniqueConstraintError || error instanceof ValidationError){
                    return res.status(409).json({ status: "ERR_CONSTRAINT", message: error.message })    
                }        
                else {
                    return res.status(500).json({ status: "ERR_SERVER", message: error.message })    
                }
            })
    })
    .catch(error => {
        return res.status(500).json({ status: "ERR_SERVER", message: error.message })    
    })
}

/*********************************************************
UPDATE (SIGNUP : confirmation de l'asresse email)
- met à jour l'utilisateur
*********************************************************/
exports.signUpConfirm = (req, res) => {
    try {
        const token = req.params.token
        const decoded = jwt.verify(token, privateKey) // Vérification du token
        const id = decoded.data // Décryptage de l'id user

        UserModel.update({ verified_email: true },{
            where: {id: id}
        })
        .then((element) => {
            if(element[0] === 0) { // element[0] indique le nombre d'éléments modifiés
                const msg = "Inscription impossible : aucun utilisateur ne correspond au lien de confirmation utilisé."
                return res.status(404).json({ status: "ERR_NOT_FOUND", message: msg })
            }
    
            const msg = `L'adresse '${element.email}' a bien été confirmée.`
            return res.status(200).json({ status: "SUCCESS", message: msg })            
        })
        .catch(error => {
            return res.status(500).json({ status: "ERR_SERVER", message: error.message })
        })
    }
    catch(error) {
        let msg = ""
        switch(error.name) {
            case "TokenExpiredError":
                msg = "Le lien de validation de l'adresse email est expiré."
                break
            case "JsonWebTokenError":
                msg = "Le lien de validation de l'adresse email est invalide."
                break
            default:
                msg = "Erreur de vérification  de l'adresse email."
        }
        return res.status(401).json({ status: "ERR_AUTHENTICATION", message: msg })
    }
}
