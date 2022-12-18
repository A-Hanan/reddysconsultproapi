const router = require("express").Router();
const { Appointment } = require("../models/Appointment");

router.post("/", async (req, res) => {
  try {
    //console.log(req.body);
    const appointment = await Appointment.create(req.body);
    // console.log("body of appointment:", appointment);
    return res.status(200).json(appointment);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});
//get appointment for specific doctor with specific Id
router.post("/specificAppointments", async (req, res) => {
  try {
    //this is done because date sending from frontend was counted one day less
    var myDate = new Date(req.body.date);
    myDate.setDate(myDate.getDate() + parseInt(1));
    // console.log(myDate);
    let filter = {
      expertId: req.body.expertId,
      status: req.body.status,
      appointmentDate: myDate,
    };
    console.log("requested >", filter);

    // if (req.body.userId !== undefined) {
    //   filter = {
    //     userId: req.body.userId,
    //     status: req.body.status,
    //     appointmentDate: req.body.date,
    //   };
    // }
    // console.log("filter>>>>> ", filter);
    const appointments = await Appointment.find(filter);
    // console.log("appointments>>> appointment");
    return res.status(200).json(appointments);
  } catch (err) {
    res.status(500).send("something went wrong.....");
  }
});
router.put("/update-seen-status/:appointmentId", async (req, res) => {
  try {
    const filter = { _id: req.params.appointmentId };
    const option = { $set: { isSeen: true } };
    // console.log("id>>> ", req.body.messageId);
    //console.log("isReceived>>>", req.body.isReceived);
    const app = await Appointment.findOneAndUpdate(filter, option);
    return res.status(200).json(app);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});
//get appointment by appointment id
router.get("/getByAppointmentId/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
    });
    res.status(200).json(appointment);
  } catch {
    res.status(500).send("internal server error...");
  }
});
//update appointment
router.put("/updateAppointmentDetails", async (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const appointmentDate = req.body.appointmentDate;
  const appointmentTime = req.body.appointmentTime;
  const description = req.body.description;

  try {
    const filter = { _id: id };
    const option = { title, appointmentDate, appointmentTime, description };
    console.log("update app=> ", filter);
    const appointment = await Appointment.findOneAndUpdate(filter, option);

    return res.status(200).json(appointment);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});
//set now the upcoming appointment
router.put("/setNow/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const filter = { _id: id };
    const option = { status: "Ongoing" };
    console.log("update app=> ", filter);
    const appointment = await Appointment.findOneAndUpdate(filter, option);
    console.log("updated appointment", appointment);

    return res.status(200).json(appointment);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});
//update review status
router.put("/updateReviewStatus", async (req, res) => {
  const id = req.body.appointmentId;
  console.log("running update review");
  try {
    const filter = { _id: id };
    const option = { isReviewed: true };
    console.log("update app=> ", filter);
    const appointment = await Appointment.findOneAndUpdate(filter, option);

    return res.status(200).json(appointment);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});
//get all appointment by userId

router.post("/:userId", async (req, res) => {
  try {
    // console.log(req.params);
    // console.log(req.body);
    const appointments = await Appointment.find({
      userId: req.params.userId,
      status: req.body.status,
    });
    //console.log(appointments);
    return res.status(200).json(appointments);
  } catch (err) {
    return res.status(500).send("something went wrong.....");
  }
});

// get appointment by doctor id

router.post("/doctor/:doctorId", async (req, res) => {
  try {
    const filter = { doctorId: req.params.doctorId, status: req.body.status };
    const appointments = await Appointment.find(filter);
    return res.status(200).json(appointments);
  } catch (err) {
    res.status(500).send("something went wrong.....");
  }
});

//update status of appointment by appointment id
router.put("/update", async (req, res) => {
  try {
    const filter = { _id: req.body.appointmentId };
    let option;
    if (req.body.ratingByUser) {
      option = {
        status: req.body.status,
        ratingByUser: req.body.ratingByUser,
      };
    } else {
      option = {
        status: req.body.status,
      };
    }

    const appointment = await Appointment.findOneAndUpdate(filter, option);
    console.log("option>>>>>>,", option);
    console.log("appointment", appointment);
    return res.status(200).json(appointment);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const resp = await Appointment.findOneAndRemove(filter);
    return res.status(200).json(resp);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});
//getting client pending appointment
router.get("/pending", async (req, res) => {
  const userId = req.userId;
  const appointments = await Appointment.find({
    clientId: userId,
    status: "Pending",
  });
  console.log("pending appointments>", appointments);
  if (appointments.length > 0) {
    res.status(200).json(appointments);
  } else {
    res.status(404).json({ success: "failed" });
  }
});
//getting  attended appointment
router.get("/attended/:userId/:userType", async (req, res) => {
  // const userId = req.userId;
  const { userType, userId } = req.params;
  console.log("rq params", req.params);
  let appointments;
  if (userType == "expert") {
    appointments = await Appointment.find({
      expertId: userId,
      status: "Attended",
    });
  } else if (userType == "user") {
    appointments = await Appointment.find({
      userId: userId,
      status: "Attended",
    });
  }

  //console.log("attended appointments>", appointments);
  if (appointments?.length > 0) {
    res.status(200).json(appointments);
  } else {
    res.status(404).json({ success: "failed" });
  }
});
//getting  ongoing appointment
router.get("/ongoing/:userId/:userType", async (req, res) => {
  // const userId = req.userId;
  const { userType, userId } = req.params;
  let appointments;
  if (userType == "expert") {
    appointments = await Appointment.find({
      expertId: userId,
      status: "Ongoing",
    });
  } else if (userType == "user") {
    appointments = await Appointment.find({
      userId: userId,
      status: "Ongoing",
    });
  }
  // let appointments = await Appointment.find();

  //console.log("attended appointments>", appointments);
  if (appointments?.length > 0) {
    res.status(200).json(appointments);
  } else {
    res.status(400).json({ success: "failed" });
  }
});

//getting upcomingappointment
router.get("/upcoming/:userType/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { userType } = req.params;
  let appointments;
  if (userType == "expert") {
    appointments = await Appointment.find({
      expertId: userId,
      status: "Confirmed",
    });
  } else if (userType == "user") {
    appointments = await Appointment.find({
      userId: userId,
      status: "Confirmed",
    });
  }

  console.log("upcoming appointments>", appointments);
  if (appointments?.length > 0) {
    res.status(200).json(appointments);
  } else {
    res.status(404).json({ success: "failed" });
  }
});

//getting cancelled appointment
router.get("/cancelled/:userType", async (req, res) => {
  const userId = req.userId;
  const { userType } = req.params;
  let appointments;
  if (userType == "expert") {
    appointments = await Appointment.find({
      expertId: userId,
      status: "Cancelled",
    });
  } else if (userType == "client") {
    appointments = await Appointment.find({
      clientId: userId,
      status: "Cancelled",
    });
  }

  console.log("cancelled appointments>", appointments);
  if (appointments.length > 0) {
    res.status(200).json(appointments);
  } else {
    res.status(404).json({ success: "failed" });
  }
});
//set appointment status confirmed
router.put(
  "/confirm-appointment/:appointmentId",

  async (req, res) => {
    const { appointmentId } = req.params;
    try {
      const filter = { _id: appointmentId };
      const option = { $set: { status: "Confirmed" } };
      const updatedAppointment = await Appointment.findOneAndUpdate(
        filter,
        option
      );
      console.log("updated Appointment>", updatedAppointment);
      res.status(200).json(updatedAppointment);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);
router.post("/today-specific/:userId/:userType", async (req, res) => {
  // const userId = req.userId;
  const { userType, userId } = req.params;
  const { date } = req.body;

  console.log("date > ", date);
  let appointments = [];
  if (userType == "expert") {
    appointments = await Appointment.find({
      expertId: userId,
      status: "Confirmed",
      appointmentDate: date,
    });
  } else if (userType == "user") {
    appointments = await Appointment.find({
      userId: userId,
      status: "Confirmed",
      appointmentDate: date,
    });
  }

  console.log("todays appointments>", appointments);
  if (appointments.length > 0) {
    res.status(200).json(appointments);
  } else {
    res.status(404).json({ success: "failed" });
  }
});
module.exports = router;
