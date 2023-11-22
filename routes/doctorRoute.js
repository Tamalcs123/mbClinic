const router = require("express").Router();
const doctorController = require("../controllers/doctorController");
const authMiddleware = require("../middlewares/authMiddleware");

// get doctor info
router.post(
  "/get-doctor-info-by-user-id",
  authMiddleware,
  doctorController.getDoctorInfoByUserId
);

// get doctor info by Id
router.post(
  "/get-doctor-info-by-id",
  authMiddleware,
  doctorController.getDoctorInfoById
);

// update doctor info
router.post(
  "/update-doctor-profile",
  authMiddleware,
  doctorController.updateDoctorInfo
);

// get all user appointments
router.get(
  "/get-appointments-by-doctor-id",
  authMiddleware,
  doctorController.getAllDoctorAppointments
);

// send appointment staus notification to patient
router.post(
  "/change-appointment-status",
  authMiddleware,
  doctorController.changeAppointmentStatus
);
module.exports = router;
