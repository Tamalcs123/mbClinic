const Doctor = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");

const getDoctorInfoByUserId = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.body.userId });
    res.status(200).json({
      success: true,
      message: "Get Doctor info successfully",
      data: doctor,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting doctor info", success: false });
  }
};

const getDoctorInfoById = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.body.doctorId });
    res.status(200).json({
      success: true,
      message: "Get Doctor info successfully",
      data: doctor,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting doctor info", success: false });
  }
};

const updateDoctorInfo = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.body.userId },
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Doctor info updated successfully",
      data: doctor,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error update doctor info", success: false });
  }
};

const getAllDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.body.userId });
    const appointments = await Appointment.find({ doctorId: doctor._id });
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

const changeAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
      status,
    });
    if (!appointment) {
      res.status(200).json({ mesage: "Not appointment found", success: false });
    }

    const user = await User.findOne({ _id: appointment.userId });
    const unseenNotifications = user.unseenNotifications;
    unseenNotifications.push({
      type: "appointment-status-changed",
      message: `Your appointment has been ${status}`,
      onClickPath: "/appointments",
    });
    await user.save();
    res.status(200).json({
      message: "Appointment status updated successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error changing appointment status", success: false });
  }
};

module.exports = {
  getDoctorInfoByUserId,
  updateDoctorInfo,
  getDoctorInfoById,
  getAllDoctorAppointments,
  changeAppointmentStatus
};
