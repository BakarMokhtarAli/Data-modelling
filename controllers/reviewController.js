const Review = require("../models/reviewModel");
const APPError = require("../utils/APPError");
const catchAsync = require("../utils/catchAsync");

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();
  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user;
  const newReview = await Review.create(req.body);
  res.status(200).json({
    status: "success",
    message: "review created success",
    data: {
      review: newReview,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const deletedReview = await Review.findByIdAndDelete(req.params.id);

  if (!deletedReview) {
    return next(new APPError(`can't find review with that ID`, 404));
  }

  res.status(200).json({
    status: `success`,
    message: `Review deleted success`,
  });
});
