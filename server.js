const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app')
const con = require('./db')
const multer  = require('multer');

//File upload multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
      console.log(file);
      cb(null, Date.now() + path.extname(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
      cb(null, true);
  } else {
      cb(null, false);
  }
}
 exports.upload = multer({ storage: storage, fileFilter: fileFilter });



//DB Configuration
con.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
  });

//Server configuration
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});