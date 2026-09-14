const express = require("express");
const router = express.Router();
const { getExercises } = require("../controllers/exerciseDBController");
router.get("/exercises", getExercises);
module.exports = router;