const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./configs/connectDb");
const routes = require("./routers");
const authRouter = require("./routers/authRouter");

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();

const port = process.env.PORT || 3000;

connectDB();

routes(app);
// app.use("/auth", authRouter);

app.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(`Server starting at http://localhost:${port}`);
});
