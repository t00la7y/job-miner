import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type AccountType = "freelancer" | "recruiter";

interface SignupForm {
  name: string;
  email: string;
  password: string;
  accountType: AccountType;
  // freelancer: skills/focus area
  // recruiter: company name
  contextField: string;
}

const ROLE_CONFIG: Record<
  AccountType,
  { label: string; placeholder: string; hint: string }
> = {
  freelancer: {
    label: "What kind of work do you do?",
    placeholder: "e.g. Frontend development, copywriting, design…",
    hint: "This helps the assistant match you to relevant roles.",
  },
  recruiter: {
    label: "Company or organisation name",
    placeholder: "e.g. Acme Corp, Studio Blank…",
    hint: "Candidates will see this when you post a role.",
  },
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SignupForm>({
    name: "",
    email: "",
    password: "",
    accountType: "freelancer",
    contextField: "",
  });

  const setField = <K extends keyof SignupForm>(key: K, value: SignupForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const roleConfig = ROLE_CONFIG[form.accountType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        username: form.name.toLowerCase().replace(/\s+/g, "_"),
        password: form.password,
        accountType: form.accountType,
        ...(form.accountType === "freelancer"
          ? { skills: form.contextField }
          : { companyName: form.contextField }),
      };
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Registration failed");
      localStorage.setItem("accessToken", data.accessToken);
      navigate("/jobs");
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Server error — please try again in a moment.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 bg-gray-900 rounded-[5px]" />
            <span className="text-[15px] font-medium text-gray-900">{/*use ~Desktop/job-miner/client/src/assets/job-miner-app-icon.svg */}
              JobMiner
            </span>
          </button>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[380px]">
          <h1 className="text-[22px] font-medium text-gray-900 mb-1">
            Create an account
          </h1>
          <p className="text-[13px] text-gray-500 mb-6">
            Pick your role to get started
          </p>

          {/* Role toggle */}
          <div
            role="group"
            aria-label="Account type"
            className="flex gap-2 p-1 rounded-xl bg-gray-100 mb-6"
          >
            {(["freelancer", "recruiter"] as AccountType[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setField("accountType", role)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 capitalize",
                  form.accountType === role
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                {role === "freelancer" ? "Freelancer" : "Recruiter"}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
            {/* Full name */}
            <div>
              <label
                htmlFor="name"
                className="block text-[12px] text-gray-500 mb-1.5"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Amara Dlamini"
                className={cn(
                  "w-full px-3 py-2 text-[13px] border rounded-lg bg-white text-gray-900 placeholder-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400",
                  "border-gray-200 transition-colors",
                )}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[12px] text-gray-500 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="you@example.com"
                className={cn(
                  "w-full px-3 py-2 text-[13px] border rounded-lg bg-white text-gray-900 placeholder-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400",
                  "border-gray-200 transition-colors",
                )}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[12px] text-gray-500 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder="Min. 8 characters"
                  className={cn(
                    "w-full px-3 py-2 pr-9 text-[13px] border rounded-lg bg-white text-gray-900 placeholder-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400",
                    "border-gray-200 transition-colors",
                  )}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Password strength hint */}
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          form.password.length >= level * 2
                            ? level <= 2
                              ? "bg-red-400"
                              : level === 3
                                ? "bg-yellow-400"
                                : "bg-green-400"
                            : "bg-gray-200",
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {form.password.length < 8
                      ? "Too short"
                      : form.password.length < 12
                        ? "Getting better"
                        : "Strong password"}
                  </p>
                </div>
              )}
            </div>

            {/* Contextual field — changes with role */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5">
              <label
                htmlFor="contextField"
                className="block text-[12px] text-gray-500 mb-1.5"
              >
                {roleConfig.label}
              </label>
              <input
                id="contextField"
                type="text"
                value={form.contextField}
                onChange={(e) => setField("contextField", e.target.value)}
                placeholder={roleConfig.placeholder}
                className={cn(
                  "w-full px-3 py-2 text-[13px] border rounded-lg bg-white text-gray-900 placeholder-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400",
                  "border-gray-200 transition-colors",
                )}
              />
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                {roleConfig.hint}
              </p>
            </div>

            {/* Error */}
            {error && (
              <p
                role="alert"
                className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="my-5 border-t border-gray-100" />

          <p className="text-[12px] text-gray-500 text-center">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-gray-900 font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
          <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
            By creating an account you agree to the{" "}
            <button className="underline hover:text-gray-600 transition-colors">
              Terms
            </button>{" "}
            and{" "}
            <button className="underline hover:text-gray-600 transition-colors">
              Privacy Policy
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
