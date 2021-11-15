const express = require("express");
const cors = require('cors');
const { castToStrings } = require('./core/Sanitizer');
const cookieParser = require('cookie-parser');
const app = express();

// setInterval(() => {
//     console.log("hey, thats pretty good!");
// }, 3000);

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:8080'
}));
app.use(cookieParser());

// При обработке каждого запроса привести всё к строчному типу (на случай инъекций, я полагаю)
app.use((req, res, next) => {
    req.body = castToStrings(req.body);
    next();
});

/* - - - Роуты: - - - */
app.use("/user", require('./routes/UserRoutes'));

app.listen(3000);
console.log("Server is listening on http://localhost:3000");