import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  GraduationCap,
  PackageSearch,
  BriefcaseBusiness,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import Logo from "../../assets/logo.png";
import "./AuthForm.css";

const API_URL = import.meta.env.VITE_UNIFOUND_BACKEND_URL;

const ROLES = [
  {
    value: "Student",
    label: "Student",
    description: "I'm a university student",
    icon: GraduationCap,
  },
  {
    value: "Staff",
    label: "Staff",
    description: "I'm a university staff member",
    icon: BriefcaseBusiness,
  },
];

const AuthForm = ({ mode = "signup" }) => {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "Student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (isSignup) {
      if (!form.first_name.trim()) errs.first_name = "First name is required";
      if (!form.last_name.trim()) errs.last_name = "Last name is required";
    }
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password.trim()) errs.password = "Password is required";
    else if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignup
        ? `${API_URL}/api/auth/signup`
        : `${API_URL}/api/auth/login`;

      const body = isSignup
        ? {
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            password: form.password,
            role: form.role,
          }
        : {
            email: form.email,
            password: form.password,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message || "Something went wrong. Please try again.");
        return;
      }

      localStorage.setItem("token", data.data.token);

      login(data.data.user);

      const redirectTo = location.state?.from?.pathname ?? "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setApiError("Cannot connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-form-card">
        <div className="auth-brand">
          <img className="brand-logo" src={Logo} alt="UniFound Logo" />
        </div>

        <h2 className="auth-title">
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>
        <p className="auth-subtitle">
          {isSignup
            ? "Join UniFound to report and find lost items."
            : "Sign in to access your dashboard."}
        </p>

        {isSignup && (
          <div className="auth-role-toggle">
            {ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.value}
                  type="button"
                  className={`auth-role-btn ${form.role === role.value ? "auth-role-btn--active" : ""}`}
                  onClick={() => set("role", role.value)}
                >
                  <Icon size={18} />
                  <div>
                    <span className="auth-role-label">{role.label}</span>
                    <span className="auth-role-desc">{role.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {apiError && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: "600",
              color: "#dc2626",
              marginBottom: "4px",
            }}
          >
            {apiError}
          </div>
        )}

        <form className="auth" onSubmit={handleSubmit} noValidate>
          {isSignup && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div
                className={`auth-field ${errors.first_name ? "auth-field--error" : ""}`}
              >
                <label className="auth-label">First Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bryan"
                  value={form.first_name}
                  onChange={(e) => set("first_name", e.target.value)}
                />
                {errors.first_name && (
                  <span className="auth-error">{errors.first_name}</span>
                )}
              </div>

              <div
                className={`auth-field ${errors.last_name ? "auth-field--error" : ""}`}
              >
                <label className="auth-label">Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jacalan"
                  value={form.last_name}
                  onChange={(e) => set("last_name", e.target.value)}
                />
                {errors.last_name && (
                  <span className="auth-error">{errors.last_name}</span>
                )}
              </div>
            </div>
          )}

          <div
            className={`auth-field ${errors.email ? "auth-field--error" : ""}`}
          >
            <label className="auth-label">Email</label>
            <input
              type="email"
              placeholder="you@gmail.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
            {errors.email && <span className="auth-error">{errors.email}</span>}
          </div>

          <div
            className={`auth-field ${errors.password ? "auth-field--error" : ""}`}
          >
            <label className="auth-label">Password</label>
            <div className="auth-password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={isSignup ? "Min. 6 characters" : "Your password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <span className="auth-error">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading
              ? isSignup
                ? "Creating Account..."
                : "Signing In..."
              : isSignup
                ? "Create Account"
                : "Sign In"}
          </button>

          <p className="auth-switch">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link to={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
