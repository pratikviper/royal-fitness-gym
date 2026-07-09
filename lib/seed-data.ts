import { doc, setDoc, writeBatch, collection } from "firebase/firestore";
import { db } from "./firebase";
import { calculateBmi } from "./bmi";

const isBrowser = typeof window !== "undefined";

const getPastDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
};

const getFutureDateStr = (daysAhead: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
};

// Seeding configuration
export async function seedDatabase(adminUid: string): Promise<void> {
  const mockUids = Array.from({ length: 12 }, (_, i) => `mock_member_${i + 1}`);

  // 1. MOCK TRAINERS
  const mockTrainers = [
    { id: "trainer_1", name: "Rajesh Kumar", specialization: "Weight Training", phone: "+91 98765 00001", email: "rajesh@royalfitness.com", assignedCount: 4 },
    { id: "trainer_2", name: "Sunita Rao", specialization: "Cardio & Conditioning", phone: "+91 98765 00002", email: "sunita@royalfitness.com", assignedCount: 3 },
    { id: "trainer_3", name: "Amit Pathak", specialization: "Personal Coaching", phone: "+91 98765 00003", email: "amit@royalfitness.com", assignedCount: 3 },
    { id: "trainer_4", name: "Vijay Negi", specialization: "Strength & Power", phone: "+91 98765 00004", email: "vijay@royalfitness.com", assignedCount: 2 },
  ];

  // 2. MOCK MEMBERS PROFILE DETAILS
  const mockMembersProfiles = [
    { uid: mockUids[0], fullName: "Rohan Sharma", email: "rohan@gmail.com", phoneNumber: "+91 98123 45601", joiningDate: getPastDateStr(90), membershipId: "RF-10021", gender: "Male", age: 24, address: "Sector 15, Noida", dob: "2002-04-12", emergencyContact: "Father: +91 98123 45699", role: "member", trainerId: "trainer_1" },
    { uid: mockUids[1], fullName: "Priya Patel", email: "priya@gmail.com", phoneNumber: "+91 98123 45602", joiningDate: getPastDateStr(60), membershipId: "RF-10022", gender: "Female", age: 22, address: "Andheri West, Mumbai", dob: "2004-09-22", emergencyContact: "Mother: +91 98123 45698", role: "member", trainerId: "trainer_2" },
    { uid: mockUids[2], fullName: "Vikram Singh", email: "vikram@gmail.com", phoneNumber: "+91 98123 45603", joiningDate: getPastDateStr(120), membershipId: "RF-10023", gender: "Male", age: 31, address: "DLF Phase 3, Gurugram", dob: "1995-11-05", emergencyContact: "Wife: +91 98123 45697", role: "member", trainerId: "trainer_4" },
    { uid: mockUids[3], fullName: "Neha Sen", email: "neha@gmail.com", phoneNumber: "+91 98123 45604", joiningDate: getPastDateStr(45), membershipId: "RF-10024", gender: "Female", age: 26, address: "Salt Lake, Kolkata", dob: "2000-02-18", emergencyContact: "Brother: +91 98123 45696", role: "member", trainerId: "trainer_3" },
    { uid: mockUids[4], fullName: "Karan Malhotra", email: "karan@gmail.com", phoneNumber: "+91 98123 45605", joiningDate: getPastDateStr(15), membershipId: "RF-10025", gender: "Male", age: 28, address: "Indiranagar, Bengaluru", dob: "1998-07-30", emergencyContact: "Friend: +91 98123 45695", role: "member", trainerId: "trainer_1" },
    { uid: mockUids[5], fullName: "Anjali Mehta", email: "anjali@gmail.com", phoneNumber: "+91 98123 45606", joiningDate: getPastDateStr(80), membershipId: "RF-10026", gender: "Female", age: 27, address: "Ghatkopar, Mumbai", dob: "1999-01-25", emergencyContact: "Husband: +91 98123 45694", role: "member", trainerId: "trainer_2" },
    { uid: mockUids[6], fullName: "Rahul Verma", email: "rahul@gmail.com", phoneNumber: "+91 98123 45607", joiningDate: getPastDateStr(150), membershipId: "RF-10027", gender: "Male", age: 35, address: "Saket, New Delhi", dob: "1991-08-14", emergencyContact: "Father: +91 98123 45693", role: "member", trainerId: "trainer_3" },
    { uid: mockUids[7], fullName: "Sneha Rao", email: "sneha@gmail.com", phoneNumber: "+91 98123 45608", joiningDate: getPastDateStr(10), membershipId: "RF-10028", gender: "Female", age: 23, address: "Jayanagar, Bengaluru", dob: "2003-03-08", emergencyContact: "Mother: +91 98123 45692", role: "member", trainerId: "trainer_1" },
    { uid: mockUids[8], fullName: "Siddharth Joshi", email: "sid@gmail.com", phoneNumber: "+91 98123 45609", joiningDate: getPastDateStr(200), membershipId: "RF-10029", gender: "Male", age: 29, address: "Kothrud, Pune", dob: "1997-12-19", emergencyContact: "Sister: +91 98123 45691", role: "member", trainerId: "trainer_4" },
    { uid: mockUids[9], fullName: "Aditya Roy", email: "aditya@gmail.com", phoneNumber: "+91 98123 45610", joiningDate: getPastDateStr(35), membershipId: "RF-10030", gender: "Male", age: 25, address: "Bani Park, Jaipur", dob: "2001-05-15", emergencyContact: "Father: +91 98123 45690", role: "member", trainerId: "trainer_3" },
    // Expiring Soon (<= 7 days remaining)
    { uid: mockUids[10], fullName: "Kabir Mehta", email: "kabir@gmail.com", phoneNumber: "+91 98123 45611", joiningDate: getPastDateStr(85), membershipId: "RF-10031", gender: "Male", age: 33, address: "Bandra West, Mumbai", dob: "1993-02-28", emergencyContact: "Wife: +91 98123 45689", role: "member", trainerId: "trainer_1" },
    // Expired
    { uid: mockUids[11], fullName: "Sanya Sen", email: "sanya@gmail.com", phoneNumber: "+91 98123 45612", joiningDate: getPastDateStr(100), membershipId: "RF-10032", gender: "Female", age: 24, address: "Salt Lake, Kolkata", dob: "2002-10-10", emergencyContact: "Mother: +91 98123 45688", role: "member", trainerId: "trainer_2" },
  ];

  // 3. MOCK MEMBERSHIPS
  const mockMemberships = [
    { planId: "all-in-one", planName: "All In One", startDate: getPastDateStr(90), endDate: getFutureDateStr(90), durationMonths: 6, pricePaid: 9000 }, // Rohan
    { planId: "weight-cardio", planName: "Weight Training + Cardio", startDate: getPastDateStr(60), endDate: getFutureDateStr(30), durationMonths: 3, pricePaid: 5500 }, // Priya
    { planId: "weight-training", planName: "Weight Training", startDate: getPastDateStr(120), endDate: getFutureDateStr(60), durationMonths: 6, pricePaid: 6500 }, // Vikram
    { planId: "all-in-one", planName: "All In One", startDate: getPastDateStr(45), endDate: getFutureDateStr(45), durationMonths: 3, pricePaid: 6500 }, // Neha
    { planId: "all-in-one", planName: "All In One", startDate: getPastDateStr(15), endDate: getFutureDateStr(75), durationMonths: 3, pricePaid: 6500 }, // Karan
    { planId: "weight-cardio", planName: "Weight Training + Cardio", startDate: getPastDateStr(80), endDate: getFutureDateStr(10), durationMonths: 3, pricePaid: 5500 }, // Anjali
    { planId: "weight-training", planName: "Weight Training", startDate: getPastDateStr(150), endDate: getFutureDateStr(30), durationMonths: 6, pricePaid: 6500 }, // Rahul
    { planId: "all-in-one", planName: "All In One", startDate: getPastDateStr(10), endDate: getFutureDateStr(350), durationMonths: 12, pricePaid: 14000 }, // Sneha
    { planId: "weight-cardio", planName: "Weight Training + Cardio", startDate: getPastDateStr(200), endDate: getFutureDateStr(165), durationMonths: 12, pricePaid: 12000 }, // Siddharth
    { planId: "weight-training", planName: "Weight Training", startDate: getPastDateStr(35), endDate: getFutureDateStr(55), durationMonths: 3, pricePaid: 4500 }, // Aditya
    // Expiring Soon (Ends in 4 days)
    { planId: "weight-cardio", planName: "Weight Training + Cardio", startDate: getPastDateStr(86), endDate: getFutureDateStr(4), durationMonths: 3, pricePaid: 5500 }, // Kabir
    // Expired (Ended 5 days ago)
    { planId: "weight-training", planName: "Weight Training", startDate: getPastDateStr(95), endDate: getPastDateStr(5), durationMonths: 3, pricePaid: 4500 }, // Sanya
  ];

  // 4. HISTORICAL BMI RECORDS (2 per member for trend logging)
  const mockBmiReports: Array<{ uid: string; weightKg: number; heightCm: number; calculatedAt: string; bmiScore: number; category: string }> = [];
  
  mockMembersProfiles.forEach((member, index) => {
    const defaultHeight = 160 + (index % 4) * 6; // range 160-178
    const baseWeight = 55 + (index % 5) * 6;     // range 55-79
    
    // Previous calculation (30 days ago)
    const prevWeight = baseWeight + 2.5; // weighed slightly more
    const prevBmi = calculateBmi(defaultHeight, prevWeight);
    mockBmiReports.push({
      uid: member.uid,
      weightKg: prevWeight,
      heightCm: defaultHeight,
      calculatedAt: getPastDateStr(30),
      bmiScore: prevBmi.bmi,
      category: prevBmi.category,
    });

    // Current calculation (5 days ago)
    const currBmi = calculateBmi(defaultHeight, baseWeight);
    mockBmiReports.push({
      uid: member.uid,
      weightKg: baseWeight,
      heightCm: defaultHeight,
      calculatedAt: getPastDateStr(5),
      bmiScore: currBmi.bmi,
      category: currBmi.category,
    });
  });

  // 5. HISTORICAL PAYMENTS (20 logs)
  const mockPayments = [
    { invoiceNo: "INV-2026-101", uid: mockUids[0], planName: "All In One", amount: 9000, method: "UPI", status: "Paid", date: getPastDateStr(90) },
    { invoiceNo: "INV-2026-102", uid: mockUids[1], planName: "Weight Training + Cardio", amount: 5500, method: "Card", status: "Paid", date: getPastDateStr(60) },
    { invoiceNo: "INV-2026-103", uid: mockUids[2], planName: "Weight Training", amount: 6500, method: "Cash", status: "Paid", date: getPastDateStr(120) },
    { invoiceNo: "INV-2026-104", uid: mockUids[3], planName: "All In One", amount: 6500, method: "UPI", status: "Paid", date: getPastDateStr(45) },
    { invoiceNo: "INV-2026-105", uid: mockUids[4], planName: "All In One", amount: 6500, method: "UPI", status: "Paid", date: getPastDateStr(15) },
    { invoiceNo: "INV-2026-106", uid: mockUids[5], planName: "Weight Training + Cardio", amount: 5500, method: "Card", status: "Paid", date: getPastDateStr(80) },
    { invoiceNo: "INV-2026-107", uid: mockUids[6], planName: "Weight Training", amount: 6500, method: "Cash", status: "Paid", date: getPastDateStr(150) },
    { invoiceNo: "INV-2026-108", uid: mockUids[7], planName: "All In One", amount: 14000, method: "UPI", status: "Paid", date: getPastDateStr(10) },
    { invoiceNo: "INV-2026-109", uid: mockUids[8], planName: "Weight Training + Cardio", amount: 12000, method: "UPI", status: "Paid", date: getPastDateStr(200) },
    { invoiceNo: "INV-2026-110", uid: mockUids[9], planName: "Weight Training", amount: 4500, method: "Cash", status: "Paid", date: getPastDateStr(35) },
    { invoiceNo: "INV-2026-111", uid: mockUids[10], planName: "Weight Training + Cardio", amount: 5500, method: "UPI", status: "Paid", date: getPastDateStr(86) },
    { invoiceNo: "INV-2026-112", uid: mockUids[11], planName: "Weight Training", amount: 4500, method: "Card", status: "Paid", date: getPastDateStr(95) },
    
    // Add some past payments for same users showing historical renewals
    { invoiceNo: "INV-2025-054", uid: mockUids[0], planName: "All In One", amount: 6500, method: "UPI", status: "Paid", date: getPastDateStr(180) },
    { invoiceNo: "INV-2025-045", uid: mockUids[2], planName: "Weight Training", amount: 4500, method: "Cash", status: "Paid", date: getPastDateStr(210) },
    { invoiceNo: "INV-2025-032", uid: mockUids[6], planName: "Weight Training", amount: 4500, method: "Card", status: "Paid", date: getPastDateStr(240) },
    { invoiceNo: "INV-2025-021", uid: mockUids[8], planName: "Weight Training + Cardio", amount: 5500, method: "UPI", status: "Paid", date: getPastDateStr(320) },

    // Pending / Failed Payments
    { invoiceNo: "INV-2026-P01", uid: mockUids[10], planName: "Renewal Balance", amount: 2000, method: "UPI", status: "Pending", date: getPastDateStr(2) },
    { invoiceNo: "INV-2026-P02", uid: mockUids[1], planName: "Lockers Fee", amount: 300, method: "Cash", status: "Pending", date: getPastDateStr(1) },
    { invoiceNo: "INV-2026-F01", uid: mockUids[5], planName: "Supplement Purchase", amount: 3200, method: "Card", status: "Failed", date: getPastDateStr(4) },
    { invoiceNo: "INV-2026-F02", uid: mockUids[11], planName: "Weight Training Renew", amount: 4500, method: "UPI", status: "Failed", date: getPastDateStr(5) },
  ];

  // 6. ATTENDANCE LOGS (Last 7 days of logs)
  const mockAttendance: Array<{ uid: string; date: string; status: "Present" | "Absent" }> = [];
  mockUids.forEach((uid, index) => {
    // Generate records for the last 7 days
    for (let day = 0; day < 7; day++) {
      const dateStr = getPastDateStr(day);
      // Give each member 70-80% present rate, except expired member
      const isExpiredUser = index === 11;
      const isAbsent = isExpiredUser || (Math.random() < 0.25);
      
      mockAttendance.push({
        uid,
        date: dateStr,
        status: isAbsent ? "Absent" : "Present",
      });
    }
  });

  // 7. CONTACT FORM SUBMISSIONS (5 enquries)
  const mockEnquiries = [
    { name: "Rahul Deshmukh", email: "rahul.desh@gmail.com", phone: "+91 99887 76655", message: "Hi, I am interested in the All In One 6-month package. Are personal trainer fees included in it?", date: getPastDateStr(4), status: "Pending", reply: "" },
    { name: "Meera Nair", email: "meera.nair@yahoo.com", phone: "+91 99112 23344", message: "Do you have a special ladies batch in the morning? What are the working hours?", date: getPastDateStr(3), status: "Replied", reply: "Hello Meera, yes, we have dedicated sessions and the gym is open from 6:00 AM to 10:00 PM. Check our Contact section." },
    { name: "George Kutty", email: "george.k@outlook.com", phone: "+91 98450 12345", message: "Interested in corporate packages for 10 people. Please send quotation details.", date: getPastDateStr(2), status: "Pending", reply: "" },
    { name: "Suresh Raina", email: "suresh.raina@gmail.com", phone: "+91 99540 88210", message: "I want to join starting this Friday. Can I get a free trial session on Thursday?", date: getPastDateStr(1), status: "Pending", reply: "" },
    { name: "Kirti Sen", email: "kirti.sen@gmail.com", phone: "+91 98712 11022", message: "Need to update my phone number in your lists. Joined last week.", date: getPastDateStr(6), status: "Replied", reply: "Done Kirti, updated in database profile." },
  ];

  // 8. GYM SETTINGS
  const mockSettings = {
    gymName: "Royal Fitness Elite",
    logoText: "ROYAL FITNESS",
    address: "Royal Heights, 4th Floor, Sector 62, Noida, UP - 201301",
    contactNumber: "+91 98765 43210",
    workingHours: "Mon-Sat: 6:00 AM - 10:00 PM, Sun: 7:00 AM - 12:00 PM",
    socialInstagram: "https://instagram.com/royalfitness",
    socialFacebook: "https://facebook.com/royalfitness",
    socialTwitter: "https://twitter.com/royalfitness",
    entryFee: 300,
  };

  // Ensure Admin Profile exists in users
  const adminProfile = {
    uid: adminUid,
    fullName: "Gym Administrator",
    email: "admin@royalfitness.com",
    phoneNumber: "+91 99999 88888",
    joiningDate: getPastDateStr(180),
    membershipId: "RF-ADMIN-01",
    role: "admin",
    photoURL: null,
  };

  // --- WRITE TO FIRESTORE IF AVAILABLE ---
  if (db) {
    try {
      // 1. Seed Admin Document
      await setDoc(doc(db, "users", adminUid), adminProfile, { merge: true });

      // 2. Seed Trainers (Write docs)
      for (const trainer of mockTrainers) {
        await setDoc(doc(db, "trainers", trainer.id), trainer);
      }

      // 3. Seed Users & Memberships & BMI reports
      for (let i = 0; i < mockMembersProfiles.length; i++) {
        const member = mockMembersProfiles[i];
        const membership = mockMemberships[i];

        await setDoc(doc(db, "users", member.uid), member);
        await setDoc(doc(db, "memberships", member.uid), membership);
      }

      // 4. Seed BMI history logs (Use auto IDs in subcollection or root)
      // To keep it simple and structured, let's write to a root 'bmi_reports' collection
      for (let i = 0; i < mockBmiReports.length; i++) {
        const rep = mockBmiReports[i];
        // unique composite key
        const repId = `${rep.uid}_${rep.calculatedAt}`;
        await setDoc(doc(db, "bmi_reports", repId), rep);
      }

      // 5. Seed Payments
      for (const p of mockPayments) {
        await setDoc(doc(db, "payments", p.invoiceNo), p);
      }

      // 6. Seed Attendance
      for (const att of mockAttendance) {
        const attId = `${att.uid}_${att.date}`;
        await setDoc(doc(db, "attendance", attId), att);
      }

      // 7. Seed Enquiries
      // Auto ID enquiries
      for (let i = 0; i < mockEnquiries.length; i++) {
        const enq = mockEnquiries[i];
        await setDoc(doc(db, "contact_enquiries", `enq_${i + 1}`), enq);
      }

      // 8. Seed Settings
      await setDoc(doc(db, "settings", "gym_settings"), mockSettings);

      console.log("Firestore database seeded successfully!");
    } catch (e) {
      console.error("Firestore seeding failed, writing to localStorage fallback:", e);
    }
  }

  // --- LOCALSTORAGE FALLBACK WRITE (Mock mode) ---
  if (isBrowser) {
    // 1. Admin Profile
    localStorage.setItem(`rf_profile_${adminUid}`, JSON.stringify(adminProfile));

    // 2. Mock UIDs list
    localStorage.setItem("rf_member_uids", JSON.stringify(mockUids));

    // 3. Profiles & memberships
    mockMembersProfiles.forEach((member, index) => {
      localStorage.setItem(`rf_profile_${member.uid}`, JSON.stringify(member));
      localStorage.setItem(`rf_membership_${member.uid}`, JSON.stringify(mockMemberships[index]));
    });

    // 4. BMI History
    mockMembersProfiles.forEach((member) => {
      const history = mockBmiReports.filter((r) => r.uid === member.uid);
      localStorage.setItem(`rf_bmi_history_${member.uid}`, JSON.stringify(history));
    });

    // 5. Payments, Attendance, Trainers, Enquiries, Settings
    localStorage.setItem("rf_payments", JSON.stringify(mockPayments));
    localStorage.setItem("rf_attendance", JSON.stringify(mockAttendance));
    localStorage.setItem("rf_trainers", JSON.stringify(mockTrainers));
    localStorage.setItem("rf_enquiries", JSON.stringify(mockEnquiries));
    localStorage.setItem("rf_settings", JSON.stringify(mockSettings));

    // Seed default pricing plans if not exists
    const mockPlans = [
      { id: "weight-training", name: "Weight Training", price: 4500, duration: "3 Months", status: "Active", features: "Gym Access, Weight Floor, Workout Plan, Certified Trainers" },
      { id: "weight-cardio", name: "Weight Training + Cardio", price: 5500, duration: "3 Months", status: "Active", features: "Everything in WT, Cardio Access, Functional Area, Group Classes" },
      { id: "all-in-one", name: "All In One", price: 6500, duration: "3 Months", status: "Active", features: "Everything in WC, 1-on-1 Personal Trainer, Custom Diet Plans, Priority Support" },
    ];
    localStorage.setItem("rf_plans", JSON.stringify(mockPlans));

    // Trigger local storage change
    window.dispatchEvent(new Event("storage"));
  }
}
