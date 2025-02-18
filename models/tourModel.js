const mongoose = require("mongoose");
const slugify = require("slugify");
const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: `Price Discount must below regular price`,
      },
    },
    rating: {
      type: Number,
      default: 4.5,
      max: [5, "tour rating must below 5"],
      min: [1, "tour rating must above 1"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    // secretTour: {
    //     type: Boolean,
    //     default: false
    // },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficult"],
      enum: {
        values: ["easy", "normal", "hard"],
        message: "a difficulty must be either easy, normal or hard",
      },
    },
    slug: String,
    startLocation: {
      type: {
        type: String,
        default: "point",
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    location: [
      {
        type: {
          type: String,
          default: "Point",
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// virtual populate
tourSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "tour",
  // justOne: true
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
