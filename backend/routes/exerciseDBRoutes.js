const express = require("express");
const router = express.Router();
const { getExercises , searchExercises } = require("../controllers/exerciseDBController");

router.get("/exercises", getExercises);
router.get("/exercises/search", searchExercises);

module.exports = router;