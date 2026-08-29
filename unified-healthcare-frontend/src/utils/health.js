// Shared patient health calculations — age from DOB, BMI from height/weight.
// Used by the patient Profile, patient Dashboard, doctor PatientProfile and
// admin Patients views so the numbers are computed one way everywhere.

/** Whole-year age from a date of birth. Returns null if missing / invalid. */
export const calcAge = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 0 && age < 150 ? age : null;
};

/** BMI (1 decimal) from height in cm + weight in kg. Null if inputs invalid. */
export const calcBMI = (heightCm, weightKg) => {
  const h = Number(heightCm);
  const w = Number(weightKg);
  if (!Number.isFinite(h) || !Number.isFinite(w)) return null;
  if (h < 50 || h > 260 || w < 2 || w > 500) return null;
  const bmi = w / (h / 100) ** 2;
  return Math.round(bmi * 10) / 10;
};

/** { label, color } for a BMI value, or null. */
export const bmiCategory = (bmi) => {
  if (bmi == null) return null;
  if (bmi < 18.5) return { label: "Underweight", color: "#3b82f6" };
  if (bmi < 25) return { label: "Normal", color: "#10b981" };
  if (bmi < 30) return { label: "Overweight", color: "#f59e0b" };
  return { label: "Obese", color: "#ef4444" };
};

/** DOB -> "12 Mar 1990" (or "—"). */
export const formatDOB = (dob) => {
  if (!dob) return "—";
  const d = new Date(dob);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

/** DOB -> "yyyy-mm-dd" for <input type="date">. */
export const toDateInput = (dob) => {
  if (!dob) return "";
  const d = new Date(dob);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};
