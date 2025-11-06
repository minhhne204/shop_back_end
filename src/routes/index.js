const productRoutes = require("./productRoutes");
const routes = (app) => {
  app.use("/api/product", productRoutes);
};
module.exports = routes;
