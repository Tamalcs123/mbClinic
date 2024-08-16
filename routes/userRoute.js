const router = require("express").Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// register
router.post("/register", userController.register);

// login
router.post("/login", userController.login);

//get-user-info-by-id
router.post(
  "/get-user-info-by-id",
  authMiddleware,
  userController.getUserInfoById
);

// apply-doctor-account
router.post(
  "/apply-doctor-account",
  authMiddleware,
  userController.applyDoctorAccount
);

// mark-all-notifications-as-seen
router.post(
  "/mark-all-notifications-as-seen",
  authMiddleware,
  userController.markAllNotifications
);

// delete-all-notifications
router.post(
  "/delete-all-notifications",
  authMiddleware,
  userController.deleteAllNotifications
);

// get all approved doctor

router.get(
  "/get-all-approved-doctors",
  authMiddleware,
  userController.getAllApprovedDoctors
);

// book appointment

router.post(
  "/book-appointment",
  authMiddleware,
  userController.bookAppointment
);

// check booking avilability

router.post(
  "/check-booking-availability",
  authMiddleware,
  userController.bookAppointmentAvailability
);

// get all user appointments
router.get(
  "/get-appointments-by-user-id",
  authMiddleware,
  userController.getAllUserAppointments
);

// get all user appointments admin
router.get(
  "/get-appointments-admin",
  // authMiddleware,
  userController.getAllUserAppointmentsAdmin
);

module.exports = router;
