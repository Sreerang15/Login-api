const con = require("../db");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const { promisify } = require("util");

const dbquery = promisify(con.query).bind(con);

exports.protected = async (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers.authorization;
  //console.log(token.startsWith("Bearer "));
  try {
    if (token.startsWith("Bearer ")) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }

    var decoded = await promisify(jwt.verify)(token, "secretkey");

    const user = await dbquery(
      "SELECT first_name, email FROM users where id = ?",
      decoded.sub
    );

    req.user = user;
    req.user_id = decoded.sub;
    req.token = token;
    return next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "You are not Logged in",
    });
  }
};

exports.changePassword = async (req, res) => {
  /*

  try {
    console.log(req.user_id);
    var dbresult = await dbquery(
      "SELECT password FROM users where id = ?",
      req.user_id
    );
  } catch (err) {
    return res.json({
      success: false,
      message: err,
    });
  }
  console.log(` ${dbresult}`);
  var hash = dbresult[0].password;
  console.log(`hash ${hash}`);

  var currentPassword = req.body.currentPassword;
  var newPassword = req.body.newPassword;
  bcrypt.compare(currentPassword, hash);

  var newhash = bcrypt.hash(newPassword, 10);
  try {
    await dbquery(`UPDATE \`users\` SET  ? WHERE id = "${req.user_id}"`, {
      password: newhash,
    });
    res.json({
      success: true,
      message: "Password changed",
    });
  } catch (err) {
    res.json({
      success: false,
      message: "Current password is wrong",
    });
  }

  */

  const query = "SELECT password FROM users where id = ?";
  con.query(query, req.user_id, (err, dbresult) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err,
      });
    } else {
      let hash = dbresult[0].password;
      console.log(hash);
      //hash = hash.replace(/^\$2y(.+)$/i, "$2a$1");
      const currentPassword = req.body.currentPassword;
      const newPassword = req.body.newPassword;

      bcrypt.compare(currentPassword, hash, function (err, result) {
        if (err) {
          return res.status(400).json({
            success: false,
            message: "Current Password is wrong",
          });
        }

        if (result) {
          bcrypt.hash(newPassword, 10, function (err, newhash) {
            if (err) {
              return res.status(400).json({
                success: false,
                message: err,
              });
            } else {
              con.query(
                `UPDATE \`users\` SET  ? WHERE id = "${req.user_id}"`,
                { password: newhash },
                (updateErr) => {
                  if (updateErr) {
                    return res.status(400).json({
                      success: false,
                      message: err,
                    });
                  } else {
                    return res.json({
                      success: true,
                      message: "Password changed",
                    });
                  }
                }
              );
            }
          });
        } else {
          return res.status(400).json({
            success: false,
            message: "current password wrong",
          });
        }
      });
    }
  });
};

exports.signup = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let userData = req.body;
  let h;

  // Hashing Password and storing in db
  bcrypt.hash(req.body.password, 12, function (err, hash) {
    if (err) {
      return res.status(400).json({ err });
    } else {
      userData.password = hash;
      const query = "INSERT INTO users set ?";
      con.query(query, userData, (err, result) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err,
          });
        } else {
          return res.status(200).json({
            success: true,
            message: "New User Created Successfully",
            data: userData,
          });
        }
      });
    }
  });
};

exports.login = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const { email, password } = req.body;

  // Check if user exists && password is correct
  const query = "SELECT id,email,password FROM users where email = ?";
  con.query(query, email, (err, result) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err,
      });
    }
    if (result.length) {
      let hashedPassword = result[0].password;

      bcrypt.compare(password, hashedPassword, function (err, user) {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err,
          });
        }
        if (user) {
          const token = jwt.sign({ sub: result[0].id }, process.env.SECRET, {
            expiresIn: "24h", // expires in 24 hours
          });
          const cookieOptions = {
            expires: new Date(
              Date.now() +
                process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
          };
          res.cookie("jwt", token, cookieOptions);
          res.status(200).json({
            success: true,
            data: {
              token,
              user_id: result[0].id,
              name: result[0].name,
              email: result[0].email,
            },
          });
        } else {
          res.status(400).json({
            success: false,
            message: "Email or Password is incorrect",
          });
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Email or Password is incorrect",
      });
    }
  });
};

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
    message: "Logged Out",
  });
};

const newPasswordGenerate = async () => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let retVal = "";
  for (let i = 0, n = charset.length; i < 5; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

exports.forgotPassword = async function (req, res) {
  con.query(
    "SELECT id, email FROM `users` WHERE email= ?",
    req.body.email,
    async (err, result) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err,
        });
      }

      if (result && result.length) {
        const newPassword = await newPasswordGenerate();
        const hash = bcrypt.hashSync(newPassword, 10);
        con.query(
          `UPDATE \`users\` SET  ? WHERE id = "${result[0].id}"`,
          { password: hash },
          (updateerr) => {
            if (updateerr) throw updateerr;

            console.log("new password sent for testing", newPassword);
            return res.json({
              success: true,
              message: "Password Sent",
            });
          }
        );
      } else {
        return res.status(400).json({
          success: false,
          message: "UserNotFound",
        });
      }
    }
  );
  con.release();
};
