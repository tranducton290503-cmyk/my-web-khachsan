const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");

// Route lấy danh sách: GET /api/services
router.get("/", serviceController.getAllServices);

// Route tạo mới: POST /api/services
router.post("/", serviceController.createService);

module.exports = router;
