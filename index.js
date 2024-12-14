import express from 'express'
import bodyParser from 'body-parser'

const PORT = 3000
const app = express()
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    console.log("get")
    res.render("index.ejs")
})

app.post("/", (req, res) => {
    console.log("post")
    console.log(req.body)
})

app.listen(PORT, () => {
    console.log("Server Active runnnig Port: " + PORT)
})