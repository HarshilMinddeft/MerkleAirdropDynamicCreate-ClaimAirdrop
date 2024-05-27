import Users from "../model/userModel.js";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uplodes");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uplode = multer({
  storage,
});

// export const create = async (req, res) => {
//   try {
//     const userData = new Users(req.body);

//     if (!userData) {
//       return res.status(400).json({ message: "user data not found" });
//     }

//     const savedData = await userData.save();
//     res.status(200).json({ message: "Data added successful" });
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// };
