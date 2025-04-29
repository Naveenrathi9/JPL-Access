const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Use local MongoDB instance
    const conn = await mongoose.connect('mongodb+srv://itadmin:itpassword123@jpl.zrfjp6v.mongodb.net/?retryWrites=true&w=majority&appName=JPL');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
