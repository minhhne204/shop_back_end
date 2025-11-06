const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const routes = require("./routes");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to database
connectDB();

app.use(cors());

app.use(bodyParser.json());
routes(app);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
