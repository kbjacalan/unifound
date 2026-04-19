import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import Logo from "../../assets/logo.png";
import "./Signin.css";

const API_URL = import.meta.env.VITE_UNIFOUND_BACKEND_URL;

const Signin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
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
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message || "Something went wrong. Please try again.");
        return;
      }

      localStorage.setItem("token", data.data.token);
      login(data.data.user);

      const redirectTo = location.state?.from?.pathname ?? "/browse-items";
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

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to access your dashboard.</p>

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
                placeholder="Your password"
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
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signin;
