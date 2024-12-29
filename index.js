
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();

app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use('/favicon.ico', express.static('docs/favicon.ico'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ 
  origin: ['https://uietadmissionportal.vercel.app/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: false 
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../docs')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join('/tmp', 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Define the admission schema
const admissionSchema = new mongoose.Schema({
  name: String,
  father_name: String,
  mother_name: String,
  dob: Date,
  phone: String,
  emergency_contact: String,
  address: String,
  course: String,
  branch: String,
  board10: String,
  marks10: Number,
  board12: String,
  marks12: Number,
  jee_score: Number,
  cuet_score: Number,
  category: String,
  photo: String,
  fee_receipt: String,
  submitted_at: { type: Date, default: Date.now },
});

const Admission = mongoose.model("Admission", admissionSchema);

// Form Submission Route
app.post(
  "/submit-admission",
  upload.fields([{ name: "photo" }, { name: "receipt" }]),
  async (req, res) => {
    try {
      const formData = req.body;
      const photo = req.files["photo"] ? req.files["photo"][0].path : "";
      const feeReceipt = req.files["receipt"] ? req.files["receipt"][0].path : "";

      const admission = new Admission({
        name: formData.name,
        father_name: formData["father-name"],
        mother_name: formData["mother-name"],
        dob: formData.dob,
        phone: formData.phone,
        emergency_contact: formData["emergency-contact"],
        address: formData.address,
        course: formData.course,
        branch: formData.branch,
        board10: formData.board10,
        marks10: formData.marks10,
        board12: formData.board12,
        marks12: formData.marks12,
        jee_score: formData["jee-score"],
        cuet_score: formData["cuet-score"],
        category: formData.category,
        photo: photo,
        fee_receipt: feeReceipt,
      });

      await admission.save();
      res.json({ message: "Form submitted successfully!" });
    } catch (error) {
      console.error("Error saving data:", error);
      res.status(500).json({ message: "Error saving data", error: error.message });
    }
  }
);

// Default route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the UIET Admission Form API!');
  
});
console.log("hello")
// Export your app
module.exports = app; 
