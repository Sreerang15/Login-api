const con = require("../db");
const util = require("util");
const multer = require("multer");
const imageThumbnail = require("image-thumbnail");
const sharp = require("sharp");

const profileSize = [
  {
    width: 200,
    height: 200,
  },
  {
    width: 100,
    height: 100,
  },
  {
    width: 50,
    height: 50,
  },
];

const bannerSize = [
  {
    width: 500,
    height: 200,
  },
  {
    width: 200,
    height: 100,
  },
  {
    width: 150,
    height: 50,
  },
];

exports.getAllUsers = (req, res) => {
  const query = "Select id,first_name,last_name,email,role from users ";

  con.query(query, (err, result) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Get All Users",
      data: result,
    });
  });
};

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Please upload only images.", false);
  }
};

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "D:/Learning/Backend/loginapi/upload/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-user-${file.originalname}`);
  },
});
const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
  fileFilter: imageFilter,
});
exports.uploadUserPhoto = upload.single("file");

exports.uploadUserImage = async (req, res) => {
  if (!req.file) {
    return res.send(`You must select 1 file.`);
  }
  // console.log(req.user_id);
  const query = `update \`users\` set ? where id = 60`;

  try {
    const thumbnail = await imageThumbnail(
      `${__dirname}/1616736986170-user-user-male.png`
    );
    console.log(req.query);

    let loop = [];
    if (req.query.type == "profile") {
      loop = profileSize;
    } else {
      loop = bannerSize;
    }

    loop.forEach(async (el, index) => {
      try {
        console.log(req.file, "lkllklk");
        await sharp(req.file.buffer)
          .resize(el.width, el.width)
          .toFile(`public/images/test-${index}.jpg`);
      } catch (err) {
        console.log(err);
      }
    });

    console.log(thumbnail, "thumbnail");
  } catch (err) {
    console.error(err);
  }

  con.query(query, { image: req.file.filename }, (err, result) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(`Files has been uploaded.`);
    }
  });
};
