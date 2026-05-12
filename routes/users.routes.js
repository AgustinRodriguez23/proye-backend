import { Router } from "express"
import UsersController from "../controllers/users.controller.js"

const router = Router()

router.get("/usuarios", UsersController.getUsers)

router.post("/usuarios", UsersController.createUser)


 export default router