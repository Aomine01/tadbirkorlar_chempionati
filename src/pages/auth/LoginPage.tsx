import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logos/white full.png";
import loginBack from "../../assets/img/loginback.png";
import signupBack from "../../assets/img/signupback.png";

/* ─── Schemas ──────────────────────────────────────── */

const loginSchema = z.object({
  email: z.string().email("Noto'g'ri email format"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
});

const registerSchema = z
  .object({
    full_name: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak"),
    phone_number: z
      .string()
      .min(9, "Telefon raqamini to'liq kiriting")
      .regex(/^[\d\s\+\-\(\)]+$/, "Faqat raqamlar"),
    email: z.string().email("Noto'g'ri email format"),
    password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Parollar mos kelmadi",
    path: ["confirm_password"],
  });

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

/* ─── Shared Input ─────────────────────────────────── */

const InputField = ({
  label,
  error,
  type = "text",
  rightElement,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  rightElement?: React.ReactNode;
}) => (
  <div>
    <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-widest">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:border-[#00A8FF]/60 focus:bg-white/8 ${
          error ? "border-red-500/50" : "border-white/10"
        } ${rightElement ? "pr-12" : ""}`}
        {...rest}
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
      )}
    </div>
    {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
  </div>
);

const formatPhone = (raw: string): string => {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("998")) digits = digits.slice(3);
  digits = digits.slice(0, 9);

  let out = "+998(";
  if (digits.length > 0) out += digits.slice(0, 2);
  if (digits.length >= 2) out += ")";
  if (digits.length > 2) out += digits.slice(2, 5);
  if (digits.length > 5) out += "-" + digits.slice(5, 7);
  if (digits.length > 7) out += "-" + digits.slice(7, 9);
  return out;
};

const stripPhone = (formatted: string): string => {
  const d = formatted.replace(/\D/g, "");
  return d.startsWith("998") ? "+" + d : "+998" + d;
};

/* ─── Page ─────────────────────────────────────────── */

const LoginPage = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect already-authenticated users
  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const handleLogin = async (data: LoginForm) => {
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(data.email, data.password);
    setSubmitting(false);
    if (error) { setError(error); return; }
    navigate("/dashboard", { replace: true });
  };

  const handleRegister = async (data: RegisterForm) => {
    setError(null);
    setSubmitting(true);
    const { error } = await signUp({
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      phone_number: stripPhone(data.phone_number),
    });
    setSubmitting(false);
    if (error) { setError(error); return; }
    setSuccess(
      "Emailingizga tasdiqlash xati yuborildi. Iltimos, emailingizni tekshirib, hisobingizni tasdiqlang."
    );
  };

  const eyeBtn = (
    <button
      type="button"
      tabIndex={-1}
      onClick={() => setShowPassword((v) => !v)}
      className="text-white/30 hover:text-white/60 transition-colors cursor-pointer"
    >
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "#000001" }}
    >
      {/* Background Image overlay matching the Hero page style */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35 pointer-events-none scale-105 transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: `url(${mode === "login" ? loginBack : signupBack})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#000001]/10 via-[#000001]/50 to-[#000001] pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-black/20 backdrop-blur-sm">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 group-hover:bg-white/10 transition-colors">
              <ArrowLeft size={15} className="text-white/60" />
            </div>
            <div className="flex items-center bg-[#111111] border border-white/10 rounded-[10px] px-3 py-2.5 overflow-hidden">
              <img src={logo} alt="Yosh Tadbirkorlar Chempionati" className="h-7 w-auto object-contain" />
            </div>
          </Link>
        <span className="text-xs text-white/30" style={{ fontFamily: "var(--font-button)" }}>
          {mode === "login" ? "Ro'yxatdan o'tish" : "Shaxsiy kabinet"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); setSuccess(null); }}
            className="text-[#00A8FF] hover:underline cursor-pointer"
          >
            {mode === "login" ? "Ro'yxatdan o'ting" : "Kiring"}
          </button>
        </span>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="mb-8">
            <h1
              className="text-4xl md:text-5xl font-bold mb-2"
              style={{ fontFamily: "var(--font-zuume)" }}
            >
              {mode === "login" ? (
                <>XUSH <span style={{ color: "#00A8FF" }}>KELIBSIZ</span></>
              ) : (
                <>RO'YXATDAN <span style={{ color: "#00A8FF" }}>O'TISH</span></>
              )}
            </h1>
            <p className="text-sm text-white/40" style={{ fontFamily: "var(--font-button)" }}>
              {mode === "login"
                ? "Chempionat portaliga kirish uchun ma'lumotlaringizni kiriting"
                : "Ariza topshirish uchun hisob yarating"}
            </p>
          </div>

          {/* Success state */}
          {success ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 flex flex-col items-center text-center gap-4">
              <CheckCircle2 size={40} className="text-emerald-400" />
              <div>
                <h3 className="font-bold text-lg mb-1">Email yuborildi!</h3>
                <p className="text-sm text-white/60">{success}</p>
              </div>
              <button
                onClick={() => { setMode("login"); setSuccess(null); }}
                className="mt-2 text-sm text-[#00A8FF] hover:underline cursor-pointer"
              >
                Kirishga o'tish →
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-8 backdrop-blur-sm">
              {/* Error banner */}
              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* ── Login Form ── */}
              {mode === "login" && (
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="flex flex-col gap-4">
                  <InputField
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                    error={loginForm.formState.errors.email?.message}
                    {...loginForm.register("email")}
                  />
                  <InputField
                    label="Parol"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    error={loginForm.formState.errors.password?.message}
                    rightElement={eyeBtn}
                    {...loginForm.register("password")}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 w-full flex items-center justify-center gap-2 bg-[#00A8FF] hover:bg-[#0090dd] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-3.5 text-sm transition-all duration-200 cursor-pointer"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Kirish <ArrowRight size={16} /></>
                    )}
                  </button>
                </form>
              )}

              {/* ── Register Form ── */}
              {mode === "register" && (
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="flex flex-col gap-4">
                  <InputField
                    label="To'liq ism"
                    placeholder="Alisher Navoiy"
                    error={registerForm.formState.errors.full_name?.message}
                    {...registerForm.register("full_name")}
                  />
                  <InputField
                     label="Telefon raqam"
                     type="tel"
                     defaultValue="+998("
                     placeholder="+998(90)123-45-67"
                     error={registerForm.formState.errors.phone_number?.message}
                     {...registerForm.register("phone_number", {
                       onChange: (e) => {
                         e.target.value = formatPhone(e.target.value);
                       }
                     })}
                   />
                  <InputField
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                    error={registerForm.formState.errors.email?.message}
                    {...registerForm.register("email")}
                  />
                  <InputField
                    label="Parol"
                    type={showPassword ? "text" : "password"}
                    placeholder="Kamida 6 ta belgi"
                    error={registerForm.formState.errors.password?.message}
                    rightElement={eyeBtn}
                    {...registerForm.register("password")}
                  />
                  <InputField
                    label="Parolni tasdiqlang"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    error={registerForm.formState.errors.confirm_password?.message}
                    {...registerForm.register("confirm_password")}
                  />
                  <p className="text-xs text-white/30 leading-relaxed">
                    Ro'yxatdan o'tish orqali siz platformaning foydalanish shartlariga rozilik bildirasiz.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-1 w-full flex items-center justify-center gap-2 bg-[#00A8FF] hover:bg-[#0090dd] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-3.5 text-sm transition-all duration-200 cursor-pointer"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Hisob yaratish <ArrowRight size={16} /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default LoginPage;
