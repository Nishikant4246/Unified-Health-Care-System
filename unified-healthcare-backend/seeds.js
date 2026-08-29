import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

// ─── Inline Schemas (mirrors your actual models) ─────────────────────────────

const educationSchema = new mongoose.Schema({
  degree: { type: String },
  institution: { type: String },
  year: { type: String },
}, { _id: false });

const nmcDataSchema = new mongoose.Schema({
  doctorName: { type: String },
  registrationNo: { type: String },
  stateMedicalCouncil: { type: String },
  qualification: { type: String },
  checkedAt: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "doctor", "patient"], required: true },
  uniqueId: { type: String, unique: true, sparse: true },
  phone: { type: String, trim: true },
  gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
  status: {
    type: String,
    enum: ["pending", "approved", "suspended"],
    default: function () { return this.role === "doctor" ? "pending" : "approved"; },
  },
  verificationMethod: { type: String, enum: ["admin", "nmc", null], default: null },
  nmcVerified: { type: Boolean, default: false },
  nmcData: { type: nmcDataSchema, default: null },
  adminVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  verifiedAt: { type: Date, default: null },
  suspendedReason: { type: String, default: "" },
  specialization: { type: String, trim: true },
  qualification: { type: String, trim: true },
  licenseNumber: { type: String, trim: true },
  licenseImage: {
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
    fileType: { type: String, default: "" },
    uploadedAt: { type: Date, default: null },
  },
  experience: { type: Number, min: 0, default: 0 },
  hospital: { type: String, trim: true },
  consultationFee: { type: Number, default: 0 },
  bio: { type: String, trim: true, maxlength: 500 },
  education: { type: [educationSchema], default: [] },
  available: { type: Boolean, default: true },
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    address: { type: String, default: "" },
  },
  dateOfBirth: { type: Date },
  heightCm: { type: Number, min: 30, max: 300, default: null },
  weightKg: { type: Number, min: 1, max: 600, default: null },
  bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""], default: "" },
  address: { type: String, trim: true },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relation: { type: String },
  },
  allergies: { type: [String], default: [] },
}, { timestamps: true });

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  diagnosis: { type: String, required: true },
  medicines: [{ type: String }],
  notes: { type: String },
  reports: [{
    fileUrl: { type: String },
    fileType: { type: String },
    fileName: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  }],
  paymentAmount: { type: Number, default: 0 },
  visitDate: { type: Date, default: Date.now },
  recordType: { type: String, enum: ["system-generated", "imported"], default: "system-generated" },
}, { timestamps: true });

// Use existing models if already registered (safe for re-runs)
const User = mongoose.models.User || mongoose.model("User", userSchema);
const MedicalRecord = mongoose.models.MedicalRecord || mongoose.model("MedicalRecord", medicalRecordSchema);

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env — make sure your .env file is in the same folder as seeds.js");
  process.exit(1);
}

// ─── Helper Data ─────────────────────────────────────────────────────────────

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genders = ["male", "female"];

const indianCities = [
  "Pune", "Mumbai", "Nagpur", "Nashik", "Aurangabad", "Kolhapur",
  "Solapur", "Thane", "Nanded", "Latur", "Delhi", "Bangalore",
  "Hyderabad", "Chennai", "Ahmedabad", "Jaipur", "Lucknow", "Indore",
];

const diagnoses = [
  "Hypertension", "Type 2 Diabetes", "Upper Respiratory Tract Infection",
  "Migraine", "Gastroenteritis", "Anemia", "Hypothyroidism", "Asthma",
  "Dengue Fever", "Typhoid", "Viral Fever", "Urinary Tract Infection",
  "Osteoarthritis", "Anxiety Disorder", "Hyperlipidemia",
  "Chronic Back Pain", "Sinusitis", "Allergic Rhinitis",
  "Iron Deficiency", "Vitamin D Deficiency",
];

const medicinesList = [
  ["Metformin 500mg", "Glipizide 5mg"],
  ["Amlodipine 5mg", "Telmisartan 40mg"],
  ["Paracetamol 500mg", "Cetirizine 10mg"],
  ["Azithromycin 500mg", "Pantoprazole 40mg"],
  ["Ibuprofen 400mg", "Omeprazole 20mg"],
  ["Atorvastatin 10mg", "Aspirin 75mg"],
  ["Amoxicillin 500mg", "Doxycycline 100mg"],
  ["Levothyroxine 50mcg"],
  ["Salbutamol Inhaler", "Budesonide 200mcg"],
  ["ORS Sachet", "Zinc 20mg", "Norfloxacin 400mg"],
];

const notesList = [
  "Patient advised to follow up in 2 weeks.",
  "Recommended low-sodium diet and regular exercise.",
  "Blood sugar levels to be monitored daily.",
  "Advised bed rest for 3 days.",
  "Patient educated on medication compliance.",
  "Referred for ECG and lipid profile.",
  "Avoid cold beverages and dusty environments.",
  "Physiotherapy recommended twice a week.",
  "Follow up with blood reports after 10 days.",
  "Lifestyle modification strongly advised.",
];

// 100 Indian patient names (mixed male/female)
const patientData = [
  { name: "Aarav Sharma", gender: "male" },
  { name: "Priya Patel", gender: "female" },
  { name: "Rohan Desai", gender: "male" },
  { name: "Anjali Singh", gender: "female" },
  { name: "Vikram Joshi", gender: "male" },
  { name: "Sneha Kulkarni", gender: "female" },
  { name: "Amit Verma", gender: "male" },
  { name: "Pooja Nair", gender: "female" },
  { name: "Rahul Gupta", gender: "male" },
  { name: "Divya Reddy", gender: "female" },
  { name: "Suresh Yadav", gender: "male" },
  { name: "Kavita Iyer", gender: "female" },
  { name: "Nikhil Mehta", gender: "male" },
  { name: "Ritu Chauhan", gender: "female" },
  { name: "Pranav Bhatia", gender: "male" },
  { name: "Shreya Mishra", gender: "female" },
  { name: "Arjun Tiwari", gender: "male" },
  { name: "Neha Agarwal", gender: "female" },
  { name: "Karan Malhotra", gender: "male" },
  { name: "Sonal Saxena", gender: "female" },
  { name: "Deepak Pandey", gender: "male" },
  { name: "Pallavi Shetty", gender: "female" },
  { name: "Manish Kapoor", gender: "male" },
  { name: "Anita Bhatt", gender: "female" },
  { name: "Siddharth Rao", gender: "male" },
  { name: "Rekha Pillai", gender: "female" },
  { name: "Gaurav Tripathi", gender: "male" },
  { name: "Sunita Banerjee", gender: "female" },
  { name: "Varun Khanna", gender: "male" },
  { name: "Meena Ghosh", gender: "female" },
  { name: "Aditya Kumar", gender: "male" },
  { name: "Swati Dubey", gender: "female" },
  { name: "Rajesh Patil", gender: "male" },
  { name: "Nandita Yadav", gender: "female" },
  { name: "Harsh Shukla", gender: "male" },
  { name: "Isha Srivastava", gender: "female" },
  { name: "Tarun Goyal", gender: "male" },
  { name: "Archana Menon", gender: "female" },
  { name: "Yash Rajput", gender: "male" },
  { name: "Shalini Murthy", gender: "female" },
  { name: "Kunal Chawla", gender: "male" },
  { name: "Bindiya Shah", gender: "female" },
  { name: "Mohit Sinha", gender: "male" },
  { name: "Preeti Nambiar", gender: "female" },
  { name: "Sameer Bose", gender: "male" },
  { name: "Garima Tomar", gender: "female" },
  { name: "Vivek Dixit", gender: "male" },
  { name: "Tanvi Deshpande", gender: "female" },
  { name: "Sandeep More", gender: "male" },
  { name: "Jyoti Wagh", gender: "female" },
  { name: "Akash Shirke", gender: "male" },
  { name: "Rashmi Pawar", gender: "female" },
  { name: "Nitin Bhosale", gender: "male" },
  { name: "Madhuri Gaikwad", gender: "female" },
  { name: "Sachin Jadhav", gender: "male" },
  { name: "Varsha Salunkhe", gender: "female" },
  { name: "Omkar Shinde", gender: "male" },
  { name: "Rupali Chavan", gender: "female" },
  { name: "Pratik Mane", gender: "male" },
  { name: "Ashwini Kadam", gender: "female" },
  { name: "Vishal Thorat", gender: "male" },
  { name: "Urmila Sawant", gender: "female" },
  { name: "Nilesh Gawde", gender: "male" },
  { name: "Smita Naik", gender: "female" },
  { name: "Tushar Rane", gender: "male" },
  { name: "Aarti Tambe", gender: "female" },
  { name: "Bhushan Kale", gender: "male" },
  { name: "Lata Mhatre", gender: "female" },
  { name: "Dinesh Surve", gender: "male" },
  { name: "Kanchan Dalvi", gender: "female" },
  { name: "Mahesh Waghmare", gender: "male" },
  { name: "Sarika Katkar", gender: "female" },
  { name: "Amol Ghorpade", gender: "male" },
  { name: "Vandana Raut", gender: "female" },
  { name: "Prashant Zore", gender: "male" },
  { name: "Bharati Landge", gender: "female" },
  { name: "Yogesh Kokate", gender: "male" },
  { name: "Sunanda Pol", gender: "female" },
  { name: "Hemant Dhole", gender: "male" },
  { name: "Padma Bhor", gender: "female" },
  { name: "Shyam Bankar", gender: "male" },
  { name: "Usha Kumbhar", gender: "female" },
  { name: "Ganesh Pacharne", gender: "male" },
  { name: "Alka Pisal", gender: "female" },
  { name: "Ramesh Phad", gender: "male" },
  { name: "Nirmala Gharat", gender: "female" },
  { name: "Kishore Hatkar", gender: "male" },
  { name: "Sudha Navale", gender: "female" },
  { name: "Anil Kondhalkar", gender: "male" },
  { name: "Mangal Jedhe", gender: "female" },
  { name: "Vinod Shedge", gender: "male" },
  { name: "Pushpa Jagtap", gender: "female" },
  { name: "Chandrakant Deshpande", gender: "male" },
  { name: "Leela Patankar", gender: "female" },
  { name: "Santosh Bhavsar", gender: "male" },
  { name: "Hema Kulthe", gender: "female" },
  { name: "Dattatray Nimkar", gender: "male" },
  { name: "Vimal Godse", gender: "female" },
];

// 20 Doctors — first 5 are your named doctors
const doctorData = [
  {
    name: "Nishikant Kshirsagar",
    email: "nishikantkshirsagar22@gmail.com",
    password: "nishikant",
    specialization: "General Medicine",
    qualification: "MBBS, MD",
    licenseNumber: "MH-DOC-10001",
    experience: 10,
    hospital: "City Care Hospital, Pune",
    consultationFee: 500,
    bio: "Experienced general physician with over 10 years of practice.",
    gender: "male",
  },
  {
    name: "Shubham Kadu",
    email: "shubhamkadu@gmail.com",
    password: "shubham",
    specialization: "Cardiology",
    qualification: "MBBS, DM Cardiology",
    licenseNumber: "MH-DOC-10002",
    experience: 8,
    hospital: "Heart Care Clinic, Pune",
    consultationFee: 700,
    bio: "Cardiologist specializing in interventional procedures.",
    gender: "male",
  },
  {
    name: "Sudarshan Kakad",
    email: "sudarshankaakad@gmail.com",
    password: "sudarshan",
    specialization: "Orthopedics",
    qualification: "MBBS, MS Ortho",
    licenseNumber: "MH-DOC-10003",
    experience: 12,
    hospital: "Bone & Joint Hospital, Nashik",
    consultationFee: 600,
    bio: "Orthopedic surgeon with expertise in joint replacement.",
    gender: "male",
  },
  {
    name: "Sagar Lonkar",
    email: "sagarlonkar@gmail.com",
    password: "sagar",
    specialization: "Pediatrics",
    qualification: "MBBS, DCH",
    licenseNumber: "MH-DOC-10004",
    experience: 7,
    hospital: "Child Care Center, Aurangabad",
    consultationFee: 450,
    bio: "Dedicated pediatrician focused on child health and development.",
    gender: "male",
  },
  {
    name: "Manas Lonkar",
    email: "manaslonkar@gmail.com",
    password: "manas",
    specialization: "Dermatology",
    qualification: "MBBS, DVD",
    licenseNumber: "MH-DOC-10005",
    experience: 6,
    hospital: "Skin & Hair Clinic, Kolhapur",
    consultationFee: 550,
    bio: "Dermatologist experienced in skin disorders and cosmetic treatments.",
    gender: "male",
  },
  // Doctors 6–20
  {
    name: "Priya Deshmukh",
    email: "priyadeshmukh@gmail.com",
    password: "priya",
    specialization: "Gynecology",
    qualification: "MBBS, MS Gynae",
    licenseNumber: "MH-DOC-10006",
    experience: 9,
    hospital: "Women's Health Clinic, Mumbai",
    consultationFee: 600,
    bio: "Gynecologist with expertise in maternal and reproductive health.",
    gender: "female",
  },
  {
    name: "Rahul Patkar",
    email: "rahulpatkar@gmail.com",
    password: "rahul",
    specialization: "Neurology",
    qualification: "MBBS, DM Neurology",
    licenseNumber: "MH-DOC-10007",
    experience: 11,
    hospital: "Neuro Care Institute, Nagpur",
    consultationFee: 800,
    bio: "Neurologist specializing in epilepsy and stroke management.",
    gender: "male",
  },
  {
    name: "Anita Joshi",
    email: "anitajoshi@gmail.com",
    password: "anita",
    specialization: "Endocrinology",
    qualification: "MBBS, MD Endocrinology",
    licenseNumber: "MH-DOC-10008",
    experience: 13,
    hospital: "Diabetes & Hormone Center, Pune",
    consultationFee: 700,
    bio: "Endocrinologist managing diabetes and thyroid disorders.",
    gender: "female",
  },
  {
    name: "Vijay Shirke",
    email: "vijayshirke@gmail.com",
    password: "vijay",
    specialization: "Pulmonology",
    qualification: "MBBS, MD Pulmonology",
    licenseNumber: "MH-DOC-10009",
    experience: 8,
    hospital: "Lung Care Hospital, Solapur",
    consultationFee: 650,
    bio: "Pulmonologist treating asthma, COPD and respiratory infections.",
    gender: "male",
  },
  {
    name: "Kavitha Rao",
    email: "kavitharao@gmail.com",
    password: "kavitha",
    specialization: "Ophthalmology",
    qualification: "MBBS, MS Ophthalmology",
    licenseNumber: "MH-DOC-10010",
    experience: 10,
    hospital: "Eye Care Center, Bangalore",
    consultationFee: 500,
    bio: "Ophthalmologist with expertise in cataract and retinal surgeries.",
    gender: "female",
  },
  {
    name: "Santosh Jadhav",
    email: "santoshjadhav@gmail.com",
    password: "santosh",
    specialization: "Gastroenterology",
    qualification: "MBBS, DM Gastro",
    licenseNumber: "MH-DOC-10011",
    experience: 14,
    hospital: "Digestive Health Clinic, Pune",
    consultationFee: 750,
    bio: "Gastroenterologist managing liver, stomach and bowel conditions.",
    gender: "male",
  },
  {
    name: "Meera Kulkarni",
    email: "meerakulkarni@gmail.com",
    password: "meera",
    specialization: "Psychiatry",
    qualification: "MBBS, MD Psychiatry",
    licenseNumber: "MH-DOC-10012",
    experience: 7,
    hospital: "Mind Care Clinic, Thane",
    consultationFee: 700,
    bio: "Psychiatrist helping patients with anxiety, depression and mental health.",
    gender: "female",
  },
  {
    name: "Deepak Nair",
    email: "deepaknair@gmail.com",
    password: "deepak",
    specialization: "Nephrology",
    qualification: "MBBS, DM Nephrology",
    licenseNumber: "MH-DOC-10013",
    experience: 9,
    hospital: "Kidney Care Hospital, Chennai",
    consultationFee: 800,
    bio: "Nephrologist specializing in kidney diseases and dialysis management.",
    gender: "male",
  },
  {
    name: "Sunita Bhosale",
    email: "sunitabhosale@gmail.com",
    password: "sunita",
    specialization: "Oncology",
    qualification: "MBBS, MD Oncology",
    licenseNumber: "MH-DOC-10014",
    experience: 15,
    hospital: "Cancer Care Institute, Mumbai",
    consultationFee: 1000,
    bio: "Oncologist with extensive experience in chemotherapy and cancer care.",
    gender: "female",
  },
  {
    name: "Rajendra Patil",
    email: "rajendrapatil@gmail.com",
    password: "rajendra",
    specialization: "ENT",
    qualification: "MBBS, MS ENT",
    licenseNumber: "MH-DOC-10015",
    experience: 11,
    hospital: "ENT Specialty Clinic, Nashik",
    consultationFee: 550,
    bio: "ENT specialist treating ear, nose and throat disorders.",
    gender: "male",
  },
  {
    name: "Shalini Desai",
    email: "shalinidesai@gmail.com",
    password: "shalini",
    specialization: "Rheumatology",
    qualification: "MBBS, MD Rheumatology",
    licenseNumber: "MH-DOC-10016",
    experience: 8,
    hospital: "Joint & Immunity Clinic, Pune",
    consultationFee: 700,
    bio: "Rheumatologist treating arthritis and autoimmune conditions.",
    gender: "female",
  },
  {
    name: "Prakash Wagh",
    email: "prakashwagh@gmail.com",
    password: "prakash",
    specialization: "Urology",
    qualification: "MBBS, MS Urology",
    licenseNumber: "MH-DOC-10017",
    experience: 10,
    hospital: "Urology Hospital, Kolhapur",
    consultationFee: 750,
    bio: "Urologist with expertise in kidney stones and urological surgeries.",
    gender: "male",
  },
  {
    name: "Nanda Gaikwad",
    email: "nandagaikwad@gmail.com",
    password: "nanda",
    specialization: "Hematology",
    qualification: "MBBS, DM Hematology",
    licenseNumber: "MH-DOC-10018",
    experience: 9,
    hospital: "Blood Disorders Center, Aurangabad",
    consultationFee: 650,
    bio: "Hematologist specializing in blood disorders and transfusion medicine.",
    gender: "female",
  },
  {
    name: "Vinayak Shinde",
    email: "vinayakshinde@gmail.com",
    password: "vinayak",
    specialization: "Radiology",
    qualification: "MBBS, MD Radiology",
    licenseNumber: "MH-DOC-10019",
    experience: 7,
    hospital: "Imaging Diagnostics, Pune",
    consultationFee: 500,
    bio: "Radiologist specializing in MRI, CT scan and ultrasound diagnostics.",
    gender: "male",
  },
  {
    name: "Lata Chavan",
    email: "latachavan@gmail.com",
    password: "lata",
    specialization: "Physiotherapy",
    qualification: "BPT, MPT",
    licenseNumber: "MH-DOC-10020",
    experience: 6,
    hospital: "Rehab & Physio Clinic, Nagpur",
    consultationFee: 400,
    bio: "Physiotherapist helping patients recover from injuries and surgeries.",
    gender: "female",
  },
];

// ─── Utility Helpers ──────────────────────────────────────────────────────────

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone() {
  const prefixes = ["98", "97", "96", "95", "94", "93", "92", "91", "90", "89", "88", "87", "86", "85", "84", "83", "82", "81", "80", "79", "78", "77", "76", "75"];
  return prefixes[Math.floor(Math.random() * prefixes.length)] + Math.floor(10000000 + Math.random() * 90000000);
}

function randomDOB() {
  const start = new Date(1960, 0, 1);
  const end = new Date(2005, 0, 1);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Plausible height (cm) + weight (kg) roughly correlated, by gender
function randomHeightWeight(gender) {
  const baseH = gender === "female" ? 150 : 163;
  const heightCm = baseH + Math.floor(Math.random() * 24);
  const weightKg = Math.round((heightCm - 100) * (0.8 + Math.random() * 0.55));
  return { heightCm, weightKg };
}

// Approx lat/lng for the cities used in doctor hospital strings
const CITY_COORDS = {
  Pune:        [18.5204, 73.8567],
  Mumbai:      [19.0760, 72.8777],
  Nagpur:      [21.1458, 79.0882],
  Nashik:      [19.9975, 73.7898],
  Aurangabad:  [19.8762, 75.3433],
  Kolhapur:    [16.7050, 74.2433],
  Solapur:     [17.6599, 75.9064],
  Thane:       [19.2183, 72.9781],
  Bangalore:   [12.9716, 77.5946],
  Chennai:     [13.0827, 80.2707],
};

// Jitter a base coord a little so pins don't stack
function cityLocation(hospital) {
  const city = (hospital.split(",").pop() || "").trim();
  const base = CITY_COORDS[city];
  if (!base) return null;
  return {
    lat: base[0] + (Math.random() - 0.5) * 0.06,
    lng: base[1] + (Math.random() - 0.5) * 0.06,
    address: hospital,
  };
}

// Placeholder "scanned license" image (renders as an <img> in the admin viewer)
function licenseImageFor(name) {
  const text = "MEDICAL+LICENSE%0A" + encodeURIComponent(name);
  return {
    url: `https://placehold.co/900x650/0d1b2a/e0aa3e/png?text=${text}`,
    publicId: "",
    fileType: "image/png",
    uploadedAt: new Date(),
  };
}

function randomVisitDate() {
  const start = new Date(2023, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomPayment() {
  const fees = [300, 400, 450, 500, 550, 600, 650, 700, 750, 800, 1000];
  return randomFrom(fees);
}

// ─── Main Seed Function ───────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB:", MONGO_URI);

  // Clear existing seed data (only remove users with uniqueId matching PAT/DOC pattern)
  console.log("🗑️  Clearing old seed data...");
  const oldDoctors = await User.find({ uniqueId: /^DOC/ }).select("_id");
  const oldPatients = await User.find({ uniqueId: /^PAT/ }).select("_id");
  const oldIds = [...oldDoctors, ...oldPatients].map(u => u._id);

  if (oldIds.length > 0) {
    await MedicalRecord.deleteMany({
      $or: [{ patient: { $in: oldIds } }, { doctor: { $in: oldIds } }],
    });
    await User.deleteMany({ _id: { $in: oldIds } });
    console.log(`   Removed ${oldDoctors.length} doctors, ${oldPatients.length} patients and their records.`);
  }

  // ── Seed Doctors ─────────────────────────────────────────────────────────
  console.log("\n👨‍⚕️  Seeding 20 doctors...");
  const createdDoctors = [];

  for (let i = 0; i < doctorData.length; i++) {
    const d = doctorData[i];
    const uniqueId = `DOC${String(i + 1).padStart(4, "0")}`;
    // password = first name in lowercase (e.g. "Nishikant Kshirsagar" -> "nishikant")
    const firstName = d.name.trim().split(/\s+/)[0].toLowerCase();
    const hashedPassword = await bcrypt.hash(firstName, 10);

    // ── Status mix — named first 5 stay approved & usable ──
    let status = "approved";
    let suspendedReason = "";
    if (i === 17 || i === 18) status = "pending";               // DOC0018, DOC0019
    if (i === 19) { status = "suspended"; suspendedReason = "Repeated patient complaints — under review"; }

    // ── License image — first 5 + ~75% of the rest (some left blank on purpose) ──
    const hasLicenseImage = (i < 5 || i % 4 !== 0) && i !== 18; // blank: DOC0009 / DOC0013 / DOC0017 / DOC0019
    const licenseImage = hasLicenseImage ? licenseImageFor(d.name) : undefined;

    // ── Map location — first 5 + most of the rest (a few left unset) ──
    const withLocation = i < 5 || i % 5 !== 4;                  // unset: DOC0010 / DOC0015 / DOC0020
    const location = withLocation ? cityLocation(d.hospital) : undefined;

    const isVerified = status === "approved" || status === "suspended";

    const doctor = await User.create({
      name: d.name,
      email: d.email,
      password: hashedPassword,
      role: "doctor",
      uniqueId,
      phone: randomPhone(),
      gender: d.gender,
      status,
      suspendedReason,
      verificationMethod: isVerified ? "admin" : null,
      verifiedAt: isVerified ? new Date() : null,
      specialization: d.specialization,
      qualification: d.qualification,
      licenseNumber: d.licenseNumber,
      ...(licenseImage ? { licenseImage } : {}),
      experience: d.experience,
      hospital: d.hospital,
      consultationFee: d.consultationFee,
      bio: d.bio,
      available: status === "approved",
      ...(location ? { location } : {}),
      education: [
        { degree: d.qualification.split(",")[0].trim(), institution: "Maharashtra University of Health Sciences", year: String(2024 - d.experience - 5) },
      ],
    });

    createdDoctors.push(doctor);
    console.log(`   ✔ ${uniqueId} — ${d.name} (${d.specialization}) [${status}${licenseImage ? " · license" : " · NO license"}]`);
  }

  // ── Seed Patients ─────────────────────────────────────────────────────────
  console.log("\n🧑‍🤝‍🧑 Seeding 100 patients...");
  const createdPatients = [];

  for (let i = 0; i < patientData.length; i++) {
    const p = patientData[i];
    const uniqueId = `PAT${String(i + 1).padStart(4, "0")}`;
    // password = first name in lowercase
    const firstName = p.name.trim().split(/\s+/)[0].toLowerCase();
    const hashedPassword = await bcrypt.hash(firstName, 10);
    const emailName = p.name.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "");
    const email = `${emailName}${i + 1}@gmail.com`;
    const city = randomFrom(indianCities);

    // Leave some profiles incomplete so the "not provided" states are visible:
    //   every 6th  -> no DOB / height / weight   (PAT0007, PAT0013, ...)
    //   +3 offset  -> DOB only, no height/weight (PAT0004, PAT0010, ...)
    const incomplete = i > 0 && i % 6 === 0;
    const bodyOnly   = i > 0 && i % 6 === 3;
    const dob = incomplete ? null : randomDOB();
    const hw  = incomplete || bodyOnly ? null : randomHeightWeight(p.gender);

    const patient = await User.create({
      name: p.name,
      email,
      password: hashedPassword,
      role: "patient",
      uniqueId,
      phone: randomPhone(),
      gender: p.gender,
      status: "approved",
      ...(dob ? { dateOfBirth: dob } : {}),
      ...(hw ? { heightCm: hw.heightCm, weightKg: hw.weightKg } : {}),
      bloodGroup: randomFrom(bloodGroups),
      address: `${Math.floor(Math.random() * 999) + 1}, ${randomFrom(["Shivaji Nagar", "Pimpri", "Hadapsar", "Kothrud", "Wakad", "Baner", "Aundh", "Viman Nagar", "Koregaon Park", "Camp"])}, ${city}`,
      emergencyContact: {
        name: `${randomFrom(["Ramesh", "Suresh", "Anand", "Vijay", "Sanjay", "Geeta", "Sunita", "Priya", "Meena", "Kavita"])} ${p.name.split(" ")[1]}`,
        phone: randomPhone(),
        relation: randomFrom(["Spouse", "Father", "Mother", "Sibling", "Son", "Daughter"]),
      },
      allergies: Math.random() > 0.6
        ? [randomFrom(["Penicillin", "Sulfa drugs", "Aspirin", "Latex", "Pollen", "Dust", "Shellfish", "Peanuts"])]
        : [],
    });

    createdPatients.push(patient);
    if ((i + 1) % 10 === 0) console.log(`   ✔ Seeded ${i + 1}/100 patients...`);
  }

  // ── Seed Medical Records ──────────────────────────────────────────────────
  console.log("\n📋 Seeding medical records (1–3 records per patient)...");
  let totalRecords = 0;

  // Only approved doctors treat patients
  const treatingDoctors = createdDoctors.filter((d) => d.status === "approved");

  for (const patient of createdPatients) {
    const recordCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 records each

    for (let r = 0; r < recordCount; r++) {
      const assignedDoctor = randomFrom(treatingDoctors);
      const diagnosis = randomFrom(diagnoses);
      const medicines = randomFrom(medicinesList);
      const note = randomFrom(notesList);

      await MedicalRecord.create({
        patient: patient._id,
        doctor: assignedDoctor._id,
        diagnosis,
        medicines,
        notes: note,
        paymentAmount: randomPayment(),
        visitDate: randomVisitDate(),
        recordType: "system-generated",
      });

      totalRecords++;
    }
  }

  console.log(`   ✔ Created ${totalRecords} medical records.`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n🎉 Seeding complete!");
  console.log(`   👨‍⚕️  Doctors   : ${createdDoctors.length}`);
  console.log(`   🧑  Patients  : ${createdPatients.length}`);
  console.log(`   📋  Records   : ${totalRecords}`);
  console.log("\n📌 Login rule — password = first name in lowercase");
  console.log("   e.g. Nishikant Kshirsagar / nishikantkshirsagar22@gmail.com → password: nishikant");
  console.log("\n📌 Doctor logins (DOC0001–DOC0017 approved; use DOC0001–DOC0005 for a clean demo):");
  doctorData.forEach((d, i) => {
    const uniqueId = `DOC${String(i + 1).padStart(4, "0")}`;
    const pw = d.name.trim().split(/\s+/)[0].toLowerCase();
    console.log(`   ${uniqueId} | ${d.email.padEnd(34)} | ${pw}`);
  });
  console.log("\n   ⚠ DOC0018 & DOC0019 are PENDING — can't log in until approved; use them to test");
  console.log("     the admin approval + license-image review flow. DOC0020 is SUSPENDED.");
  console.log("     No license image: DOC0009 / DOC0013 / DOC0017 / DOC0019.");
  console.log("     No map location : DOC0010 / DOC0015 / DOC0020.");
  console.log("\n📌 Patients — password = first name lowercase (e.g. PAT0001 → 'aarav').");
  console.log("   Incomplete profiles (blank DOB + height/weight): every 6th patient (PAT0007, PAT0013 …).");
  console.log("   DOB but no height/weight: PAT0004, PAT0010, … — so age shows but BMI is blank.");

  await mongoose.disconnect();
  console.log("\n✅ Disconnected from MongoDB. Done!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});