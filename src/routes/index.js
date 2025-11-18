const productRoutes = require("./productRoutes");
const userRoutes = require("./userRouters");
const routes = (app) => {
  app.use("/api/product", productRoutes);

  app.use("/api/user", userRoutes);
};
module.exports = routes;
