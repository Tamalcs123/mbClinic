const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");

const getAllUsers = async (req, res) => {
  try {
    const user = await User.find();
    if (!user) {
      res.status(200).json({ mesage: "Not found user", success: false });
    }
    res.status(200).json({
      message: "Successfully get all users",
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error getting users", success: false });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctor = await Doctor.find();
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

const changeDoctorStatus = async (req, res) => {
  try {
    const { doctorId, status } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(doctorId, { status });
    if (!doctor) {
      res.status(200).json({ mesage: "Not found doctor", success: false });
    }

    const user = await User.findOne({ _id: doctor.userId });
    const unseenNotifications = user.unseenNotifications;
    unseenNotifications.push({
      type: "doctor-request-status",
      message: `Your doctor accout has been ${status}`,
      onClickPath: "/notifications",
    });
    user.isDoctor = status === "approved" ? true : false;
    await user.save();
    res.status(200).json({
      message: "Doctor status updated successfully",
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error update doctors status", success: false });
  }
};

module.exports = { getAllUsers, getAllDoctors, changeDoctorStatus };
