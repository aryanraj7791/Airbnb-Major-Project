const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapasync.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");

const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});


router
    .route("/")
       .get(wrapAsync(listingController.allListings))
       .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));

//New Route
router.get("/new", isLoggedIn, listingController.renderListingForm);

router
    .route("/:id")
       .get(wrapAsync(listingController.showListing))
       .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
       .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));


//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;