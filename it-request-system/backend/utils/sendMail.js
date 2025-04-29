const nodemailer = require("nodemailer");
require("dotenv").config({ path: "./backend/.env" });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendRequestMail = async (requestData, requestId) => {
  console.log("📤 Sending approval mail for request ID:", requestId);
  console.log("📧 Mail data:", requestData);

  const {
    name,
    employeeCode,
    designation,
    department,
    specialAllowance,
    item,
    reason,
    hodEmail,
  } = requestData;

  const links = {
    hrApprove: `${process.env.CLIENT_URL}/api/approve?id=${requestId}&type=hr&status=approved`,
    hrReject: `${process.env.CLIENT_URL}/api/approve?id=${requestId}&type=hr&status=rejected`,
    hodApprove: `${process.env.CLIENT_URL}/api/approve?id=${requestId}&type=hod&status=approved`,
    hodReject: `${process.env.CLIENT_URL}/api/approve?id=${requestId}&type=hod&status=rejected`,
    ithodApprove: `${process.env.CLIENT_URL}/api/approve?id=${requestId}&type=ithod&status=approved`,
    ithodReject: `${process.env.CLIENT_URL}/api/approve?id=${requestId}&type=ithod&status=rejected`,
  };

  const generateMailHTML = (approverType, approveLink, rejectLink) => `
  <div style="font-family: 'Segoe UI', sans-serif; background-color: #f5f7fa; padding: 40px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333333; margin-bottom: 20px;">IT Asset Request - Approval Required</h2>

      <p style="font-size: 15px; color: #444;">
        Dear ${approverType.toUpperCase()},
      </p>

      <p style="font-size: 15px; color: #444; line-height: 1.6;">
        An IT equipment request has been submitted by <strong>${name}</strong> (Employee Code: <strong>${employeeCode}</strong>), who is currently working as a <strong>${designation}</strong> in the <strong>${department}</strong> department.
      </p>

      <p style="font-size: 15px; color: #444; line-height: 1.6;">
        The requested item is <strong>${item}</strong>. The reason provided for this request is: <em>"${reason}"</em>.
      </p>

       <p style="font-size: 15px; color: #444; line-height: 1.6;">
      <strong> Note:- Requires special permission for the request: ${specialAllowance}</strong>.
      </p>

      <p style="font-size: 15px; color: #444; line-height: 1.6; margin-top: 25px;">
        You are requested to review and verify before responding to this request using the options below:
      </p>

      <div style="margin: 25px 0;">
        <a href="${approveLink}" style="display: inline-block; padding: 12px 22px; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 5px; margin-right: 12px;">✅ Approve</a>
        <a href="${rejectLink}" style="display: inline-block; padding: 12px 22px; background-color: #dc3545; color: #ffffff; text-decoration: none; border-radius: 5px;">❌ Reject</a>
      </div>

      <p style="font-size: 13px; color: #777; margin-top: 30px;">
        This is an automated message from the IT Request System. Please do not reply to this email.
      </p>
    </div>
  </div>
`;

  console.log("email user -> ", process.env.EMAIL_USER);
  console.log("email user -> ", process.env.EMAIL_TO_USER);

  const hrMail = {
    from: `"IT Request System" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_HR, // HR email
    subject: "[Action Required] IT Equipment Request – Approval Needed",
    html: generateMailHTML("HR", links.hrApprove, links.hrReject),
    headers: {
      "X-Priority": "3",
      "X-Mailer": "NodeMailer",
    },
  };

  const hodMail = {
    from: `"IT Request System" <${process.env.EMAIL_USER}>`,
    to: hodEmail, 
    subject: "[Action Required] IT Equipment Request – Approval Needed",
    html: generateMailHTML("HOD", links.hodApprove, links.hodReject),
    headers: {
      "X-Priority": "3",
      "X-Mailer": "NodeMailer",
    },
  };

  const ithodmail = {
    from: `"IT Request System" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_ITHOD, // ithod mail
    subject: "[Action Required] IT Equipment Request – Approval Needed",
    html: generateMailHTML("ITHOD", links.ithodApprove, links.ithodReject),
    // text: "hello",
    headers: {
      "X-Priority": "3",
      "X-Mailer": "NodeMailer",
    },
  };

  console.log(" link hrApprove -> ", links.hrApprove);
  console.log(" link hrReject -> ", links.hrReject);
  console.log(" link hodApprove -> ", links.hodApprove);
  console.log(" link hodReject -> ", links.hodReject);
  console.log(" link ithodApprove -> ", links.ithodApprove);
  console.log(" link ithodReject -> ", links.ithodReject);

  await Promise.all([
    transporter.sendMail(hrMail),
    transporter.sendMail(hodMail),
    transporter.sendMail(ithodmail),
  ]);
};

module.exports = sendRequestMail;
