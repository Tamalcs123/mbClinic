const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Appointment = require("../models/appointmentModel");
const moment = require("moment");
dotenv.config();

const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const findUser = await User.findOne({ email: email });
    if (findUser) {
      return res
        .status(200)
        .json({ message: "User already exists!", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res
      .status(500)
      .json({ message: "Error creating user", success: false });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(200)
        .json({ message: "User not found!!", success: false });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .json({ message: "Invalid credentials!!", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });
    res
      .status(200)
      .json({ message: "Successfully Logged In", success: true, data: token,myuser:user });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error logged in", success: false, error });
  }
};

const getUserInfoById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res
        .status(200)
        .json({ message: "User not found!!", success: false });
    } else {
      res.status(200).json({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting user info", success: false });
  }
};

const applyDoctorAccount = async (req, res) => {
  try {
    const newDoctor = new Doctor({ ...req.body, status: "pending" });
    await newDoctor.save();

    const adminUser = await User.findOne({ isAdmin: true });
    const unseenNotifications = adminUser.unseenNotifications;
    unseenNotifications.push({
      type: "new-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for doctor account`,
      data: {
        doctorId: newDoctor._id,
        doctorName: newDoctor.firstName + " " + newDoctor.lastName,
      },
      onClickPath: "/admin/doctorslist",
    });
    await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });
    res.status(200).json({
      success: true,
      message: "Doctors account applied successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error applying doctor account", success: false });
  }
};

const markAllNotifications = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    const unseenNotifications = user.unseenNotifications;
    const seenNotifications = user.seenNotifications;
    seenNotifications.push(...unseenNotifications);
    user.unseenNotifications = [];
    user.seenNotifications = seenNotifications;
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).json({
      message: "All notifications are marked as seen",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error during notification marked as seen",
      success: false,
    });
  }
};

const deleteAllNotifications = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.seenNotifications = [];
    user.unseenNotifications = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).json({
      message: "All notifications are deleted",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error deleting notifications", success: false });
  }
};

const getAllApprovedDoctors = async (req, res) => {
  try {
    const doctor = await Doctor.find({ status: "approved" });
    if (!doctor) {
      res.status(200).json({ mesage: "Not found doctor", success: false });
    }
    res.status(200).json({
      message: "Successfully get all doctors",
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error getting doctors", success: false });
  }
};

const bookAppointment = async (req, res) => {
  try {
    req.body.status = "pending";
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();

    const user = await User.findOne({ _id: req.body.doctorInfo.userId });

    if (!user) {
      return res.status(404).json({
        message: "Doctor not found",
        success: false,
      });
    }

    user.unseenNotifications?.push({
      type: "new-appointment-request",
      message: `A new appointment request has been made by ${req.body.userInfo.name}`,
      onClickPath: "/doctor/appointments",
    });

    await user.save();

    res.status(200).json({
      message: "Appointment booked successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error booking appointment", success: false });
  }
};

const bookAppointmentAvailability = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(60, "minute")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm")
      .add(60, "minute")
      .toISOString();

    const doctorId = req.body.doctorId;

    const appointments = await Appointment.find({
      doctorId,
      date,
      time: { $gte: fromTime, $lte: toTime },
      // status: "approved",
    });
    if (appointments.length > 0) {
      return res.status(200).json({
        message: "Slot is already occupied",
        success: false,
      });
    } else {
      return res.status(200).json({
        message: "Slot is available",
        success: true,
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error booking appointment", success: false });
  }
};

const getAllUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.body.userId });
    if (!appointments) {
      res
        .status(200)
        .json({ mesage: "Not appointments found", success: false });
    }
    res.status(200).json({
      message: "Apointments fetched Successfully",
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error fetching appointments", success: false });
  }
};

const getAllUserAppointmentsAdmin = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    if (!appointments) {
      res
        .status(200)
        .json({ mesage: "Not appointments found", success: false });
    }
    res.status(200).json({
      message: "Apointments fetched Successfully",
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error fetching appointments", success: false });
  }
};

module.exports = {
  register,
  login,
  getUserInfoById,
  applyDoctorAccount,
  markAllNotifications,
  deleteAllNotifications,
  getAllApprovedDoctors,
  bookAppointment,
  bookAppointmentAvailability,
  getAllUserAppointments,
  getAllUserAppointmentsAdmin
};
