require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:8080"
}));

/* - - - Роуты: - - - */
app.use("/users", require("./routes/Users"));
app.use("/materials", require("./routes/Materials"));
app.use("/studies", require("./routes/Studies"));

app.listen(process.env.PORT || 3000);
console.log("Server is listening on http://localhost:" + process.env.PORT || 3000);