const express = require("express");
const router = express.Router();
const {
  submitRequest,
  handleApproval,
  getAllRequests
} = require("../controllers/requestController");

router.post(
  "/request",
  (req, res, next) => {
    console.log("➡️ POST /api/request hit");
    next();
  },
  submitRequest
);

router.get(
  "/approve",
  (req, res, next) => {
    console.log("➡️ GET /api/approve hit");
    console.log("Query params:", req.query);
    next();
  },
  handleApproval
);

router.get(
  "/requests",
  (req, res, next) => {
    console.log("➡️ GET /api/requests hit");
    next();
  },
  getAllRequests
);

module.exports = router;
