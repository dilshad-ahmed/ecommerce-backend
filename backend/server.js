const app = require("./app.js");
const connectDatabse = require("./config/database");
const cloudinary = require("cloudinary");

//handling uncaught error
process.on("uncaughtException", (err) => {
  console.log(`error: ${err.message}`);
  console.log("shutting down due to uncaught error");
  process.exit(1);
});

// config
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "backend/config/config.env" });
  console.log("server env =>", process.env.NODE_ENV);
}

connectDatabse();

//cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const server = app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});

//unhandled promise rejection

process.on("unhandledRejection", (err) => {
  console.log(`error: ${err}`);
  console.log("shutting down due to unhadnled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
