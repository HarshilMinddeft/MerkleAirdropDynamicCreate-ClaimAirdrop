const mongoose = require("mongoose");

// Define schema for Users model
const userSchema = new mongoose.Schema({
  addresses: [String],
  claimAmounts: [String],
});

// Create and register Users model with Mongoose
const Users = mongoose.model("Users", userSchema);

// Connect to MongoDB
const URL =
  "mongodb+srv://harshil:harshil8888@cluster0.nguunro.mongodb.net/AirdropApp?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(URL)
  .then(async () => {
    console.log("DB connected");
    // Once connected, fetch data
    fetchData();
  })
  .catch((error) => console.error("DB connection error:", error));

// Function to fetch data
async function fetchData() {
  try {
    console.log("Fetching data from Users collection...");
    // Find all documents in the Users collection
    const users = await Users.find({}, "addresses claimAmounts");
    console.log("Users:", users);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}
