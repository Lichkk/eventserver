const authRouter = require("./authRouter");

const routes = (app) => {
  app.use("/api/auth", authRouter);
};
module.exports = routes;
