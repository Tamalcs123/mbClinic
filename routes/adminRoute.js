const router = require("express").Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");

// get all user
router.get("/get-all-users", authMiddleware, adminController.getAllUsers);

// get all doctors
router.get("/get-all-doctors", authMiddleware, adminController.getAllDoctors);

// send doctor staus notification
router.post(
  "/change-doctor-account-status",
  authMiddleware,
  adminController.changeDoctorStatus
);

module.exports = router;
