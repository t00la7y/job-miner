// ─── App.tsx router additions ──────────────────────────────────────────────
// Add these imports at the top of your App.tsx:
//
//   import LandingPage from "@/pages/LandingPage";
//   import LoginPage   from "@/pages/LoginPage";
//   import SignupPage  from "@/pages/SignupPage";
//
// And add these routes inside your <Routes> block:
//
//   <Route path="/"        element={<LandingPage />} />
//   <Route path="/login"   element={<LoginPage />}   />
//   <Route path="/signup"  element={<SignupPage />}  />
//
// Make sure react-router-dom is installed:
//   npm install react-router-dom
//   npm install -D @types/react-router-dom   (if not already present)

// ─── Updated userProfile.ts (server) ───────────────────────────────────────
// Rename jobSeeker → freelancer throughout.
// Replace the accountType field with:
//
//   accountType: "freelancer" | "recruiter" | "admin";
//
// Replace the preferences block with:
//
//   preferences: {
//     jobTypes: string[];        // full-time, part-time, freelance, contract, internship
//     industries: string[];      // tech, finance, healthcare, etc.
//     experienceLevel: string;   // entry-level, graduate, mid-level, senior
//     workModes: string[];       // remote, hybrid, on-site
//     skills?: string[];         // populated from signup contextField for freelancers
//     companyName?: string;      // populated from signup contextField for recruiters
//   };

// ─── server authController.ts — register handler addition ──────────────────
// The signup form sends either { skills } or { companyName } depending on role.
// Add this to your register controller when building the user doc:
//
//   const { name, email, password, accountType, skills, companyName } = req.body;
//
//   const user = new User({
//     name,
//     email,
//     password,          // bcrypt pre-save hook handles hashing
//     accountType,
//     preferences: {
//       ...(accountType === "freelancer" && skills
//         ? { skills: skills.split(",").map((s: string) => s.trim()) }
//         : {}),
//       ...(accountType === "recruiter" && companyName
//         ? { companyName }
//         : {}),
//     },
//   });

// ─── Protected route wrapper ────────────────────────────────────────────────
// Create src/components/ProtectedRoute.tsx:
//
//   import { Navigate } from "react-router-dom";
//
//   export function ProtectedRoute({ children }: { children: React.ReactNode }) {
//     const token = localStorage.getItem("accessToken");
//     if (!token) return <Navigate to="/login" replace />;
//     return <>{children}</>;
//   }
//
// Wrap /jobs and /jobs/post with it in App.tsx:
//
//   <Route path="/jobs" element={
//     <ProtectedRoute><JobBoard /></ProtectedRoute>
//   } />
