const Notification =
  require("../models/notification");

const getDoctorNotifications =
  async (req, res) => {

    try {

      const notifications =
        await Notification.find({
          recipient: req.params.doctorId,
          recipientType: "Doctor"
        })
        .populate("appointment")
        .sort({
          createdAt: -1
        });

      res.status(200).json({
        success: true,
        data: notifications
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message
      });

    }
  };

module.exports = {
  getDoctorNotifications
};