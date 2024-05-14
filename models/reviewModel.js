// review / rating / createdAt / ref to tour / ref to user
const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty!"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour."],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //     path: "tour",
  //     select: 'name'
  // }).populate({
  //     path: 'user',
  //     select: 'name photo'
  // })
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

//prevent duplicate review
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

// statsic method
reviewSchema.statics.calcAvgRatind = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      rating: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      rating: 4.5,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAvgRatind(this.tour);
});

//calculate avrage when review is updated or deleted
//findByIdAndUpdate
//findByIdAndDelete
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   // const r = await this.findOne()
//   this.r = await this.findOne(); // this is the way of passing data from pre middleware to post middleware
//   next();
// });

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // Get the model associated with the schema
  const Review = this.model("Review");

  // Execute the query only if it hasn't been executed before
  if (!this.r) {
    this.r = await Review.findOne();
  }

  next();
});

//after updating or deleting reveiw
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAvgRatind(this.r.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
