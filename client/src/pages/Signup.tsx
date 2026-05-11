import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

type AccountType = "freelancer" | "recruiter";

const Signup: React.FC = () => {
  const [accountType, setAccountType] = useState<AccountType>("freelancer");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    extraField: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement signup logic
    console.log("Signup:", { ...formData, accountType });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoleChange = (role: AccountType) => {
    setAccountType(role);
    setFormData((prev) => ({ ...prev, extraField: "" }));
  };

  const getExtraFieldLabel = () => {
    return accountType === "freelancer"
      ? "What kind of work do you do?"
      : "Company or organisation name";
  };

  const getExtraFieldPlaceholder = () => {
    return accountType === "freelancer"
      ? "e.g. Frontend development, copywriting..."
      : "e.g. Acme Corp, Studio Blank...";
  };

  const getExtraFieldHint = () => {
    return accountType === "freelancer"
      ? "This helps the AI match you to relevant roles."
      : "Candidates will see this when you post a role.";
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
            Create an account
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-5">
            Pick your role to get started
          </p>

          {/* Role Toggle */}
          <div className="flex gap-1.5 mb-6">
            <Button
              type="button"
              variant={accountType === "freelancer" ? "primary" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => handleRoleChange("freelancer")}
            >
              Freelancer
            </Button>
            <Button
              type="button"
              variant={accountType === "recruiter" ? "primary" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => handleRoleChange("recruiter")}
            >
              Recruiter
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Amara Dlamini"
              required
            />

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
              <label className="block text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
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

            {/* Extra field based on role */}
            <div className="bg-[var(--color-background-secondary)] border border-[var(--color-border-tertiary)] rounded-md p-3">
              <label className="block text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium mb-1">
                {getExtraFieldLabel()}
              </label>
              <Input
                type="text"
                name="extraField"
                value={formData.extraField}
                onChange={handleChange}
                placeholder={getExtraFieldPlaceholder()}
                className="border-0 bg-transparent p-0"
              />
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                {getExtraFieldHint()}
              </p>
            </div>

            <Button type="submit" className="w-full mt-6">
              Create account
            </Button>
          </form>

          <hr className="border-[var(--color-border-tertiary)] my-6" />

          <p className="text-xs text-[var(--color-text-secondary)] text-center">
            Already have an account?{" "}
            <button className="text-[var(--color-text-primary)] font-medium hover:underline">
              Sign in
            </button>
          </p>

          <p className="text-xs text-[var(--color-text-tertiary)] text-center mt-4 leading-relaxed">
            By creating an account you agree to the{" "}
            <button className="text-[var(--color-text-primary)] hover:underline">
              Terms
            </button>{" "}
            and{" "}
            <button className="text-[var(--color-text-primary)] hover:underline">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
