import express from 'express'

const app = express()
app.use(express.static("public"))
const PORT = 3000

app.get("/", (req, res) => {
    res.render("")
})

app.listen(PORT, () => {
    console.log("Server Active runnnig Port: " + PORT)
})