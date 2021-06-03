const util = require("util");
const multer = require("multer");

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

var uploadFile = multer({ storage: storage, fileFilter: imageFilter });
var upload = util.promisify(uploadFile);
module.exports = upload;
