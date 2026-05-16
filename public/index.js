console.log("app full stack :)")

const btn = document.querySelector("#btn")
const userForm = document.querySelector("#user-form")

btn.addEventListener("click",()=>{

    fetch("/api/products")
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            const productsList = document.querySelector("#products-list")

            data.forEach((product) => {
                const li = document.createElement("li")
                li.innerText = `${product.title} - $${product.price || 0}`
                productsList.appendChild(li)

            })
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

const socket = io()