class ViewsController {

    static getLanding = (req, res) => {
        res.render("index")
    }

    static getProducts = (req, res) => {
        res.render("productos")
    }
}

export default ViewsController