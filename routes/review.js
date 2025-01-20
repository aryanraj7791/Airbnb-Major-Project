const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapasync.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/review.js");

//Route for creating review
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//Delete Route for review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;