import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ??
  "mongodb://root:example@192.168.1.63:27017/api-mongoose?authSource=admin";

// Remove deprecated options
const options = {};

export const connect = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log("Connected to MongoDB");
  } catch (error: any) {
    if (error.name === "MongoServerError" && error.code === 18) {
      console.error(
        "MongoDB Authentication failed. Please check your username and password in MONGODB_URI"
      );
    } else {
      console.error("Error connecting to MongoDB:", error);
    }
    process.exit(1);
  }
};

// Event listeners
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB");
});

// Close connection on process termination
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0);
});

export default mongoose;
