console.log("app full stack :)")

const btn = document.querySelector("#btn")
const userForm = document.querySelector("#user-form")

btn.addEventListener("click",()=>{

    fetch("/usuarios")
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            console.log(data)
        })
        .catch(() => {
            console.log("error 404")
        })
})

userForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const input = userForm.querySelector("input")
    const valor = input.value
    const usuario = { name: valor }
    const usuarioString = JSON.stringify(usuario)

    fetch("/usuarios", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: usuarioString
    })
})