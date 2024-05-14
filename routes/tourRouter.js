const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require("../controllers/authController");
const reviewController = require('../controllers/reviewController');
const router = express.Router();


router
.route('/top-5-tours')
.get(tourController.aliasTour,tourController.getAllTours);

router
.route('/')
.get(authController.protect,tourController.getAllTours)
.post(tourController.createTour);

router
.route("/:id")
.get(tourController.getTour)
.patch(tourController.updateTour)
.delete(authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.deleteTour);

router.route("/:tourId/reviews")
.post(
authController.protect,
authController.restrictTo('user'),
reviewController.createReview    
)

module.exports = router;