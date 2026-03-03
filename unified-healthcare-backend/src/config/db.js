import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error);   // IMPORTANT
    process.exit(1);
  }
};

export default connectDB;