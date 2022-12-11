const express = require("express");
const User = require("../models/User");
const UserVerification = require("../models/UserVerification");
const nodemailer = require("nodemailer");
//for unique string
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
// const fetchuser = require("../middleware/fetchuser");
const CryptoJS = require("crypto-js");
var path = require("path");

require("dotenv").config();
/////////////////////////////

//nodemailer stuff
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});
console.log(process.env.AUTH_EMAIL, process.env.AUTH_PASS);
//testing nodemailer stuff
transporter.verify((error, success) => {
  if (error) {
    console.log("error in transporter", error);
  } else {
    console.log("ready for sending mails");
    console.log(success);
  }
});

//send verif email
router.post("/send-verify-email", (req, res) => {
  console.log("sending verification email");

  const { _id, email, firstName, lastName } = req.body;
  console.log("request body", req.body);
  const currentUrl = "http://localhost:3000/";

  const uniqueString = uuidv4() + _id;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify your Email, " + firstName + " " + lastName,
    html: `<h1 style="font-weight:400;">Verify your Account at <span style="color:#006;">Consult </span><span style="color:#ff9e15;">Pro</span>.</h1><p style="font-size:20px;">This link expires in
      6 hours.</p>
      <h6> <a href=${
        currentUrl + "email-verification/" + _id + "/" + uniqueString
      }><button style="padding:8px 20px;background-color:#006;border:none;
      cursor:pointer;
      color:white;fontSize:23px;">Click to Verify</button></a> .</h6>
      <h3 style="font-size:20px;">Regards: ConsultPro Team</h3>
      `,
  };
  //hash the uniqueString4
  console.log("sending mail 2");
  const saltRounds = 10;
  bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
      const newVerification = new UserVerification({
        userId: _id,
        uniqueString: hashedUniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000,
      });
      newVerification
        .save()
        .then(() => {
          transporter
            .sendMail(mailOptions)
            .then(() => {
              //email sent and verification record saved
              res.status(200).send("Verification email sent successfully");
            })
            .catch((err) => {
              console.log(err);
              res.status(500).send("Verification email failed");
            });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send("Could not save email verification data");
        });
    })
    .catch(() => {
      res.status(500).send("error while hashing email data");
    });
});
//verify email
router.get("/verify/:userId/:uniqueString", (req, res) => {
  let { userId, uniqueString } = req.params;
  console.log("user Id at verify: ", userId);
  UserVerification.find({ userId })
    .then((result) => {
      if (result.length > 0) {
        //user verification records exist so we proceed further
        const { expiresAt } = result[0];
        const hashedUniqueString = result[0].uniqueString;

        //checking expired unique string
        if (expiresAt < Date.now()) {
          //record has expired so we delete it
          UserVerification.deleteOne({ userId })
            .then((res) => {
              let message = "Link has expired. please signup again.";
              res.status(500).json({ message: message });
              // res.redirect(`/user/verified/error=true&message=${message}`);
            })
            .catch((error) => {
              let message =
                "An error occurs while clearing expired user verification record.";
              res.status(500).json({ message: message });
              // res.redirect(`/user/verified/error=true&message=${message}`);
            });
        } else {
          //if validate record exist we validate the user string
          //first compare the hashed unique string
          console.log("uniqueString", uniqueString);
          console.log("hashedUniqueString", hashedUniqueString);
          bcrypt
            .compare(uniqueString, hashedUniqueString)
            .then((result) => {
              console.log("result at auth vrif> ", result);
              if (result) {
                //strings matches
                User.updateOne({ _id: userId }, { verified: true }).then(() => {
                  UserVerification.deleteOne({ userId })
                    .then((result) => {
                      let message = "Verified successfully.";
                      res.status(200).json({ message: message });
                      // res.redirect(
                      //   `/user/verified/error=true&message=${message}`
                      // );
                    })
                    .catch((error) => {
                      let message =
                        "An error occurs while finalyzing successful verification.";
                      res.status(500).json({ message: message });
                      // res.redirect(
                      //   `/user/verified/error=true&message=${message}`
                      // );
                    });
                });
              } else {
                //existing record but incorrect verifications detailed passed
                let message =
                  "Incorrect verification details passed. check inbox";
                res.status(500).json({ message: message });
                // res.redirect(`/user/verified/error=true&message=${message}`);
              }
            })
            .catch((error) => {
              console.log(error);
              let message = "An error occurs while comparing uniquestring.";
              res.status(500).json({ message: message });
              // res.redirect(`/user/verified/error=true&message=${message}`);
            });
        }
      } else {
        let message =
          "Account record does not exist or has been verified already. Please signup or login.";
        res.status(500).json({ message: message });
        // res.redirect(`/user/verified/error=true&message=${message}`);
      }
    })
    .catch((err) => {
      console.log(err);
      let message =
        "An error occured while checking for existing user verification record.";
      res.status(500).json({ message: message });
      // res.redirect(`/user/verified/error=true&message=${message}`);
    });
});

//////////////////////////////
//////////////////////////////// sending forgot password link program //////////////////////////////
router.post("/send-change-password-link", (req, res) => {
  console.log("sending verification email", req.body);

  const { email, id } = req.body;
  const currentUrl = "http://localhost:3000/";

  const uniqueString = uuidv4() + id;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Recover your password",
    html: `<h1 style="font-weight:400;">Verify your <span style="color:#006;">Consult </span><span style="color:#ff9e15;">Pro </span>
     Account.</h1><p style="font-size:20px;">This link expires in
      6 hours.</p>
      <h6> <a href=${
        currentUrl + "recover-password/" + id + "/" + uniqueString
      }><button style="padding:8px 20px;background-color:#006;border:none;
      cursor:pointer;
      color:white;fontSize:23px;">Recover Your Account</button></a> .</h6>
      <h3 style="font-size:20px;">Regards: ConsultPro Team</h3>
      `,
  };
  //hash the uniqueString
  const saltRounds = 10;
  bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
      const newVerification = new UserVerification({
        userId: id,
        uniqueString: hashedUniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000,
      });
      newVerification
        .save()
        .then(() => {
          transporter
            .sendMail(mailOptions)
            .then(() => {
              //email sent and verification record saved
              console.log("have sent recovery email to ", mailOptions);
              res.status(200).send("recovery email sent successfully");
            })
            .catch((err) => {
              console.log(err);
              res.status(500).send("recovery email failed");
            });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send("Could not save accout recovery data");
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("error while hashing email data", err);
    });
});

router.get(
  "/recovery/update-password/:userId/:uniqueString/:newPassword",
  async (req, res) => {
    let { uniqueString, userId, newPassword } = req.params;
    /***creating new password */
    var bytes = CryptoJS.AES.decrypt(newPassword, "ReddySoftwares123");
    var password = bytes.toString(CryptoJS.enc.Utf8);
    const salt = await bcrypt.genSaltSync(10);
    const secPass = await bcrypt.hash(password, salt);
    /*** */
    console.log("user Id at verify: ", userId);
    UserVerification.find({ userId })
      .then((result) => {
        if (result.length > 0) {
          //user verification records exist so we proceed further
          const { expiresAt } = result[0];
          const hashedUniqueString = result[0].uniqueString;

          //checking expired unique string
          if (expiresAt < Date.now()) {
            //record has expired so we delete it
            UserVerification.deleteOne({ userId })
              .then((res) => {
                let message = "Link has expired. please signup again.";
                res.status(500).json({ message: message });
                // res.redirect(`/user/verified/error=true&message=${message}`);
              })
              .catch((error) => {
                let message =
                  "An error occurs while clearing expired user verification record.";
                res.status(500).json({ message: message });
                // res.redirect(`/user/verified/error=true&message=${message}`);
              });
          } else {
            //if validate record exist we validate the user string
            //first compare the hashed unique string
            console.log("uniqueString", uniqueString);
            console.log("hashedUniqueString", hashedUniqueString);

            bcrypt
              .compare(uniqueString, hashedUniqueString)
              .then((result) => {
                console.log("result at auth vrif> ", result);
                if (result) {
                  //strings matches
                  console.log("everything matches");

                  User.updateOne({ _id: userId }, { password: secPass }).then(
                    () => {
                      UserVerification.deleteOne({ userId })
                        .then((result) => {
                          let message = "recovered successfully.";
                          res.status(200).json({ message: message });
                        })
                        .catch((error) => {
                          let message =
                            "An error occurs while finalyzing successful recovery.";
                          res.status(500).json({ message: message });
                        });
                    }
                  );
                } else {
                  //existing record but incorrect verifications detailed passed
                  let message =
                    "Incorrect recovery details passed. check inbox";
                  res.status(500).json({ message: message });
                  // res.redirect(`/user/verified/error=true&message=${message}`);
                }
              })
              .catch((error) => {
                console.log(error);
                let message = "An error occurs while comparing uniquestring.";
                res.status(500).json({ message: message });
                // res.redirect(`/user/verified/error=true&message=${message}`);
              });
          }
        } else {
          let message =
            "Account record does not exist . Please signup or login.";
          res.status(500).json({ message: message });
          // res.redirect(`/user/verified/error=true&message=${message}`);
        }
      })
      .catch((err) => {
        console.log(err);
        let message =
          "An error occured while checking for existing user verification record.";
        res.status(500).json({ message: message });
        // res.redirect(`/user/verified/error=true&message=${message}`);
      });
  }
);

///////////////////////////////////////////////////////////////////////////////////////////////////

const JWT_SECRET = "CONNECTLEGAL";
var checkNull = true;
// Route 1: Create a user using: POST "/api/auth/createuser", No login required
router.post("/createuser", async (req, res) => {
  let success = false;
  console.log("req sign up > ", req.body);

  // If there are errors, return bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  // Check Weather the user with this email exits already
  // console.log("req>", req.body);
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(200).send("Sorry a user with email already exits");
    }

    var bytes = CryptoJS.AES.decrypt(req.body.password, "ReddySoftwares123");
    var password = bytes.toString(CryptoJS.enc.Utf8);
    const salt = await bcrypt.genSaltSync(10);
    const secPass = await bcrypt.hash(password, salt);
    console.log("random test ", await bcrypt.compare("11111111", secPass));
    // console.log("password>>", secPass);
    console.log("all set man");
    user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: secPass,
    });

    const data = {
      user: {
        id: user.id,
      },
    };
    const authtoken = jwt.sign(data, JWT_SECRET);

    //res.json(user)
    success = true;
    res.json({ success, authtoken, data });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route 2: Authenticate a user using: POST "/api/auth/login", No login required
router.post(
  "/login",
  [
    body("email", "Enter Valid Email").isEmail(),
    body("password", "Password cant be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    // If there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log("checkpoint 1");
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct information" });
      }
      console.log("checkpoint 2");
      //decrypt here
      const passwordCompare = await bcrypt.compare(password, user.password);
      console.log("password compare", passwordCompare);
      if (!passwordCompare) {
        success = false;
        return res.status(400).json({
          success,
          error: "Please try to login with correct information",
        });
      }
      console.log("user of id", user?.id);
      let userData = {
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        id: user.id,
        verified: user?.verified,
      };
      console.log("checkpoint 3");
      const authtoken = jwt.sign(user.id, JWT_SECRET);

      success = true;
      res.json({ success, authtoken, userData });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);
router.post("/get-auth-token-fb-user", (req, res) => {
  const { id } = req.body.userID;
  const data = {
    user: {
      id: id,
    },
  };
  try {
    const authtoken = jwt.sign(data, JWT_SECRET);
    res.status(200).json(authtoken);
  } catch (err) {
    res.status(500).send("error in generating auth token for fb user");
  }
});
// Route 3: Get logged in users detail using: POST "/api/auth/getuser", login required
router.post("/getuser", async (req, res) => {
  //this will not work incase of google or facebook user

  try {
    userId = req.userId;
    console.log("userId", userId);
    const user = await User.findById(userId).select("-password");
    return res.status(200).send(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error");
  }
});
//complete user signup info
router.put("/complete-lawyer-info", async (req, res) => {
  //this will not work incase of google or facebook user

  try {
    const {
      isProfileCompleted,
      startAvailabilityHour,
      endAvailabilityHour,
      appointmentFee,
    } = req.body;
    console.log("req.body>>>> ", req.body);
    const userId = req.userId;
    const filter = { _id: userId };
    const option = {
      $set: {
        isProfileCompleted,
        startAvailabilityHour,
        endAvailabilityHour,
        appointmentFee,
      },
    };
    const updatedUser = await User.findOneAndUpdate(filter, option).select(
      "-password"
    );
    console.log("updated user >>> ", updatedUser);
    return res.status(200).send(updatedUser);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error");
  }
});
//get user by id in url
router.get("/getUserById/:userId", async (req, res) => {
  //this will not work incase of google or facebook user

  try {
    userId = req.params.userId;
    console.log("userId", userId);
    const user = await User.findById(userId).select("-password");
    return res.status(200).send(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal Server Error");
  }
});

/**
 *  @desc Update Login User
 *
 *  @param name
 *  @param qualification
 *  @param password
 */
router.post("/update", async (req, res) => {
  console.log("req.body", req.body);
  try {
    const { name, password, old_password } = req.body;
    const userId = req.userId;

    //console.log("old password", old_password);
    if (old_password) {
      let oldPasswordBytes = CryptoJS.AES.decrypt(old_password, "CONNECTLEGAL");
      let oldPassword = oldPasswordBytes.toString(CryptoJS.enc.Utf8);
      let user = await User.findOne({ _id: userId });
      //console.log(user);
      const passwordCompare = await bcrypt.compare(oldPassword, user.password);
      //console.log("password compare>>>>", passwordCompare);
      if (!passwordCompare) {
        return res.status(500).send("wrong information sent");
      }
    }

    const updatedData = { name };

    if (password) {
      console.log("new password>>>", password);
      let bytes = CryptoJS.AES.decrypt(password, "CONNECTLEGAL");
      let pass = bytes.toString(CryptoJS.enc.Utf8);
      const salt = await bcrypt.genSaltSync(10);
      updatedData.password = await bcrypt.hash(pass, salt);
    }
    console.log("updated data>>> ", updatedData);
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updatedData },
      {
        new: true,
        upsert: true,
      }
    );
    //console.log("updation true");
    const userData = {
      name: updatedUser.name,
      qualification: updatedUser.qualification,
      userType: updatedUser.userType,
    };
    res.status(200).json({
      success: true,
      userData,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/check-user-by-email/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.find({ email });
    console.log("finding user by email >>> ", user);
    const response = {
      success: true,
      id: user[0]._id,
    };
    console.log("response>>>>>>>>", response);
    if (user.length > 0) {
      res.status(200).json(response);
    } else {
      res.status(404).send("user with this email not found");
    }
  } catch (err) {
    res.status(404).send("error in finding email");
  }
});
router.post(
  "/update-complete-profile-information/:userId",
  async (req, res) => {
    const { userId } = req.params;
    const { personal, professional, fee, bankAccountDetails } = req.body;
    console.log("req", req.body);
    try {
      const data = {};
      const user = await User.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            personalInfo: personal,
            professionalInfo: professional,
            appointmentFee: fee,
            bankAccountDetails,
            isProfileCompleted: true,
          },
        }
      );
      console.log("user", user);
      res.status(200).json(user);
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

//send contact us email
router.post("/send-query-email", (req, res) => {
  console.log("sending verification email");

  const { email, name, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).send("incorrect credential");
  }
  console.log("request body", req.body);
  const toEmail = process.env.AUTH_EMAIL;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: toEmail,
    subject: "Recieved query from  " + name + " ",
    html: `
    <h1 style="font-weight:400;">Recieved query from ${name},
    <span style="color:#006;">Consult </span>
    <span style="color:#ff9e15;">Pro</span>
    </h1>
    <h3 style="font-size:17px;">Sender Name : ${name}</h3>
    <h3 style="font-size:17px;">Sender Email: ${email}</h3>
    <h3 style="font-size:17px;">message: ${message}.</h3>
    <h4 style="font-size:20px;">Regards: ConsultPro Team</h4>
      `,
  };
  //hash the uniqueString4
  console.log("sending query mail 2");

  transporter
    .sendMail(mailOptions)
    .then(() => {
      //email sent and verification record saved
      console.log("query mail sent successfully");
      res.status(200).send("query email sent successfully");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("query email sending failed");
    });
});

module.exports = router;
