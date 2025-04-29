// backend/controllers/requestController.js
const Request = require("../models/Request");
const sendRequestMail = require("../utils/sendMail");
const sendFinalMailToIT = require("../utils/sendFinalMail");
// const sendIthodMail = require("../utils/sendIthodMail");

const submitRequest = async (req, res) => {
  try {
    console.log("📥 Incoming request data:", req.body);

    const { hodEmail, ...restData } = req.body;
    const newRequest = new Request({ ...restData, hodEmail });

    await newRequest.save();
    console.log("✅ Request saved to DB:", newRequest._id);

    await sendRequestMail({ ...restData, hodEmail }, newRequest._id);
    console.log("📧 Emails sent to HR & HOD for approval");

    res.status(200).json({ message: "Request submitted" });
  } catch (err) {
    console.error("❌ Error in submitRequest:", err);
    res.status(500).json({ error: "Request submission failed" });
  }
};

const handleApproval = async (req, res) => {
  const { id, type, status } = req.query;

  console.log("handleApproval called with query:", req.query);

  if (
    !["hr", "hod", "it", "ithod"].includes(type) ||
    !["approved", "rejected"].includes(status)
  ) {
    console.log("Invalid approval parameters:", { type, status });
    return res.status(400).send("Invalid approval parameters");
  }

  try {
    const request = await Request.findById(id);

    console.log("request -> ", request);

    if (!request) {
      console.log("Request not found for id:", id);
      return res.status(404).send("Request not found");
    }

    request.status[type] = status;
    await request.save();

    // After HR and HOD approval, send mail to ITHOD
    // if (
    //   (request.status.hr === "approved" || request.status.hr === "rejected") &&
    //   (request.status.hod === "approved" ||
    //     request.status.hod === "rejected") &&
    //   request.status.it === "pending"
    // ) {
    //   console.log("Triggering sendIthodMail for request:", request._id);
    //   await sendIthodMail(request);
    //   console.log("sendIthodMail completed for request:", request._id);
    // }

    // Send final mail to IT if ITHOD responded
    if (
      (request.status.ithod === "approved" ||
        request.status.ithod === "rejected") &&
      (request.status.hr === "approved" || request.status.hr === "rejected") &&
      (request.status.hod === "approved" || request.status.hod === "rejected")
    ) {
      await sendFinalMailToIT(request);
    }

    console.log("status hr -> ", request.status.hr);
    console.log("status hod -> ", request.status.hod);
    console.log("status ithod -> ", request.status.ithod);

    // Styled success page
    res.send(`
      <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f8; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="background-color: #ffffff; border: 1px solid #e0e0e0; padding: 40px; border-radius: 12px; text-align: center; max-width: 500px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
          <div style="font-size: 50px; margin-bottom: 15px;">
            ${status === "approved" ? "✅" : "❌"}
          </div>
          <h2 style="color: ${status === "approved" ? "#28a745" : "#dc3545"}; margin-bottom: 15px; font-size: 24px; font-weight: 600;">
            Request ${status === "approved" ? "Approved" : "Rejected"}
          </h2>
          <p style="font-size: 16px; color: #555;">
            <strong>${type.toUpperCase()}</strong> has 
            ${status === "approved" ? "approved" : "rejected"} the request.
          </p>
          
          <div style="margin-top: 30px;">
            <p style="font-size: 14px; color: #777;">Request ID:</p>
            <p style="font-weight: 500; color: #333; font-size: 18px;">${id}</p>
          </div>
          
          <p style="margin-top: 40px; font-size: 13px; color: #999;">
            This action has been recorded successfully.<br/>
            Thank you for your response.
          </p>
        </div>
      </div>
    `);
  } catch (err) {
    console.error("Error in handleApproval:", err);
    res.status(500).send("Something went wrong");
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    console.error("❌ Error fetching requests:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

module.exports = { submitRequest, handleApproval, getAllRequests };
