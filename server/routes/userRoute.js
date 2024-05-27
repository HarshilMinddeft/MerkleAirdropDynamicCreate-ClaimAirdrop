const express = require("express");
const multer = require("multer");
const csv = require("csvtojson");
const fs = require("fs");
const Users = require("../model/userModel.js");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uplodes");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage,
});
const router = express.Router();
router.post("/uploadAll", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const { token, userAddress, contractAddress, distributorAddress } =
      req.body;
    const stream = fs.createReadStream(req.file.path);
    const jsonArray = await csv().fromStream(stream);
    const isValid = jsonArray.every((entry) => entry.hasOwnProperty("address"));
    if (!isValid) {
      return res
        .status(400)
        .json({ error: "Address field is missing in some entries" });
    }
    const allAddresses = jsonArray.map((entry) => entry.address);
    const allClaimAmounts = jsonArray.map((entry) => entry.claimAmount);

    const createdUser = await Users.create({
      addresses: allAddresses,
      claimAmounts: allClaimAmounts,
      contractAddress,
      userAddress,
      token,
      distributorAddress,
    });
    const { _id } = createdUser;

    res.json({
      _id,
      addresses: allAddresses,
      claimAmounts: allClaimAmounts,
      contractAddress,
      userAddress,
      token,
      distributorAddress,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/fetchData", async (req, res) => {
  try {
    const users = await Users.findOne(
      {},
      "addresses claimAmounts contractAddress"
    );
    res.json(users);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/fetchallData", async (req, res) => {
  try {
    const users = await Users.find(
      {},
      "addresses claimAmounts contractAddress token distributorAddress _id"
    );
    res.json(users);
  } catch (error) {
    console.log("error");
  }
});

router.post("/transactionRejected", async (req, res) => {
  try {
    const { lastInsertedId } = req.body;

    // Delete the most recent user data
    await Users.findByIdAndDelete(lastInsertedId);

    res.json({ message: "RDD" });
  } catch (error) {
    console.error("Error deleting user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/uploadCA", async (req, res) => {
  try {
    const { distributorAddress } = req.body;
    const user = await Users.findOne().sort({ _id: -1 });
    if (!user) {
      return res.status(404).json({ error: "No user found" });
    }
    user.distributorAddress = distributorAddress;
    await user.save();
    res.json({
      message: "DistriutorAddress set for airdrop",
      distributorAddress,
    });
  } catch (error) {
    console.error("Error uploading contract address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
