import userModel from "../src/models/users.model.js"

class UsersController {
    static getUsers = (req, res) => {
        userModel.find()
        .then((data) => {
            res.send(data)
        })
        .catch((err) => {
            res.status(500).send("error")
        })
    }


    static createUser = (req, res) => {
        userModel.create(req.body)
        .then(() => {
            res.send("OK")
        })
        .catch((err) => {
            res.status(500).send("error")
        })
    }
}

export default UsersController