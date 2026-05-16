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
            const div = document.createElement("div")
            div.classList.add("product-item")
            const thumbnail = Array.isArray(product.thumbnails) ? product.thumbnails[0] : product.thumbnails;
            const isActive = product.status === "active";

            div.innerHTML = `
                <img src="${thumbnail || ''}" alt="${product.title}" onerror="this.style.display='none'"/>
                <div class="product-body">
                <p class="product-code">${product.code || 'N/A'}</p>
                <p class="product-title">${product.title || 'Sin nombre'}</p>
                <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">
                ${isActive ? 'Activo' : 'Inactivo'}
                </span>
                <span class="product-category">${product.category || 'Sin categoría'}</span>
                <div class="product-meta">
                <span class="product-price">$${(product.price || 0).toLocaleString('es-AR')}</span>
                <span class="product-stock">Stock: ${product.stock ?? 0}</span>
                </div>
                </div>
                `;
    productsList.appendChild(div)
    div.addEventListener("click", () => {
    window.location.href = `/products/${product._id}`
})
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