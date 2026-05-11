import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log("Login:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--color-background-primary)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-5 h-5 bg-[var(--color-text-primary)] rounded"></div>
          <span className="text-base font-medium text-[var(--color-text-primary)]">{/*use ~Desktop/job-miner/client/src/assets/job-miner-app-icon.svg */}
            JobMiner
          </span>
        </div>

        {/* Form */}
        <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-lg p-6">
          <h1 className="text-xl font-medium text-[var(--color-text-primary)] mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                  aria-label="Toggle password visibility"
                >
                  👁️
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6">
              Sign in
            </Button>
          </form>

          <hr className="border-[var(--color-border-tertiary)] my-6" />

          <p className="text-xs text-[var(--color-text-secondary)] text-center">
            No account?{" "}
            <button className="text-[var(--color-text-primary)] font-medium hover:underline">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
