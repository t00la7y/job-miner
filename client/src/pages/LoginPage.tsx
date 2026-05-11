import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Login failed");
      // Store access token and redirect
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
            <span className="text-[15px] font-medium text-gray-900"> {/*use ~Desktop/job-miner/client/src/assets/job-miner-app-icon.svg */}
              JobMiner
            </span>
          </button>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[360px]">
          <h1 className="text-[22px] font-medium text-gray-900 mb-1">
            Welcome back
          </h1>
          <p className="text-[13px] text-gray-500 mb-8">
            Sign in to your account
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
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
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-[12px] text-gray-500"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-[12px] text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="••••••••"
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
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="my-5 border-t border-gray-100" />

          <p className="text-[12px] text-gray-500 text-center">
            No account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-gray-900 font-medium hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
