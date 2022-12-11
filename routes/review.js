const router = require("express").Router();
const { Review } = require("../models/RatingAndReview");

// create a new appointment in the database

router.post("/", async (req, res) => {
  //console.log("review body>", req.body);
  try {
    //console.log(req.body);
    const review = await Review.create(req.body);
    // console.log("body of appointment:", appointment);
    return res.status(200).json(review);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send(err.message);
  }
});
router.get("/:appointmentId", async (req, res) => {
  //console.log("review body>", req.body);
  const { appointmentId } = req.params;
  try {
    //console.log(req.body);
    const review = await Review.findOne({ appointmentId: appointmentId });
    // console.log("body of appointment:", appointment);
    return res.status(200).json(review);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send(err.message);
  }
});
//get all review for a lawyer
router.get("/all-reviews/:expertId", async (req, res) => {
  console.log("review body>", req.params);
  const { expertId } = req.params;
  try {
    //console.log(req.body);
    const reviews = await Review.find({ expertId: expertId });
    console.log("reviews:", reviews);
    return res.status(200).json(reviews);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send(err.message);
  }
});

module.exports = router;
