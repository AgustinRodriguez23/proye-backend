
class Usuario {

    #password

    constructor(nombreInput, emailInput, passwordInput) {
        this.nombre = nombreInput
        this.email = emailInput
        this.#password = passwordInput
    }

    saludar() {
        console.log("hola")
    }

    getPassword(){
        console.log(this.#password)
    }
}

export default Usuario