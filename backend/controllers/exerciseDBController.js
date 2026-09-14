const axios = require("axios");
const catchAsync = require("../utils/catchAsync");

exports.getExercises = catchAsync(async (req, res, next) => {
    const response = await axios.get(
        `${process.env.EXERCISE_DB_BASE_URL}/exercises`
    );

    res.status(200).json({
        success: true,
        results: response.data.data.length,
        data: response.data.data
    });
});