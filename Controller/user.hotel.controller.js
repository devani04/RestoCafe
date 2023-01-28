const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const Userdetails = require("../Model/user.hotel.model");
const CoAdminProductAdd = require("../Model/co-admin.product.hotel.model");
const UserBookHotel = require("../Model/User.book.hotel.model");
const CoAdminTime = require("../Model/co-admin.time.hotel.model");
const { body, validationResult } = require("express-validator");

exports.UserRegistration = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const name = req.body.name;
  const contact = req.body.contact;
  const email = req.body.email;
  const password = req.body.password;
  const address = req.body.address;

  Userdetails.find({ email }).then((data) => {
    if (data == "") {
      const hpassword = bcrypt.hash(password, saltRounds).then((hash) => {
        Userdetails.create({
          name,
          email,
          contact,
          password: hash,
          address,
        }).then((data) => {
          res.send(data);
        });
      });
    } else {
      res.send({ message: "email already exists" });
    }
  });
};

exports.UserLogin = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const email = req.body.email;
  const password = req.body.password;
  Userdetails.find({ email }).then((data) => {
    if (data) {
      const token = jwt.sign(
        { email: data.email, id: data._id },
        "secretOrPrivateKeysecretOrPrivateKey",
        { expiresIn: "1h" }
      );
      bcrypt.compare(password, data[0].password, (err, isMatch) => {
        if (isMatch) {
          res.send({ data: data, token: token });
        } else {
          res.send({ message: "invelid password" });
        }
      });
    } else {
      res.send("invelid email");
    }
  });
};

exports.UserFoegetPassword = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const email = req.body.email;
  const password = req.body.password;

  Userdetails.find({ email }).then((data) => {
    if (data == "") {
      res.send({ message: "invelid email" });
    } else {
      const hpassword = bcrypt.hash(password, saltRounds).then((hash) => {
        Userdetails.updateOne({ email }, { $set: { password: hash } }).then(
          (data) => {
            res.send(data);
          }
        );
      });
    }
  });
};

exports.UserfindAllhotel = (req, res) => {
  CoAdminProductAdd.find().then((data) => {
    res.send(data);
    console.log(data[0]);
  });
};

exports.UserbookHotel = async (req, res) => {
  try {
    const address = req.body.address;
    const member = req.body.member;
    const time = req.body.time;
    const ProductId = req.body.ProductId;
    const UserId = req.body.UserId;
    const arr = [];

    CoAdminProductAdd.find({ _id: ProductId }).then((data) => {
      const coadminid = data[0].CoAdmindId;
      CoAdminTime.find({ coadminid: coadminid }).then((data) => {
        // console.log(data);
        const Array_obj = data[0].time;
        for (const i of Array_obj) {
          if (i.time == time) {
            i.sit = i.sit - member;
          }
        }
        Array_obj.forEach((Element) => {
          // console.log(Element);
          if (Element.sit <= 0) {
            arr.push("hello");
            return res.send("hotel is full");
          }
        });
        if (arr == "") {
          console.log(Array_obj);
          CoAdminTime.updateOne(
            { coadminid: coadminid },
            { $set: { time: Array_obj } }
          ).then((data) => {
            console.log(data);
            // res.send(data);
          });
          UserBookHotel.create({
            address,
            member,
            time,
            ProductId,
            UserId,
          }).then((data) => {
            // console.log(data);
            res.send(data);
          });
        } else {
          // console.log("hotel full");
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
};
