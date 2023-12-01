const mongoose = require("mongoose");

const connectDatabse = () => {
  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("database is connected ");
    });
};

module.exports = connectDatabse;
