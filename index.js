import express from 'express'

const PORT = 3000
const app = express()
app.use(express.static("public"))

app.get("/", (req, res) => {
    res.render("index.ejs")
})

app.listen(PORT, () => {
    console.log("Server Active runnnig Port: " + PORT)
})