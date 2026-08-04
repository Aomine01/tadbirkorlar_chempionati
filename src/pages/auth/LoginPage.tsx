import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Eye, EyeOff, ArrowRight, CheckCircle2, Sun, Moon } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import logoWhite from "../../assets/logos/white full.png";
import logoBlue from "../../assets/logos/blue-full.png";
import loginBack from "../../assets/img/loginback.png";
import signupBack from "../../assets/img/signupback.png";
import loginLight from "../../assets/imglight/loginlight.png";
import signupLight from "../../assets/imglight/signuplight.png";

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
  isLight = false,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  rightElement?: React.ReactNode;
  isLight?: boolean;
}) => (
  <div>
    <label
      className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
        isLight ? "text-slate-700" : "text-white/60"
      }`}
      style={{ fontFamily: "var(--font-button)" }}
    >
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/50 ${
          isLight
            ? "bg-slate-100/90 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white"
            : "bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:bg-white/10"
        }`}
        {...rest}
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {rightElement}
        </div>
      )}
    </div>
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
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
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isLight = theme === "light";

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

  const currentBg = isLight
    ? mode === "login" ? loginLight : signupLight
    : mode === "login" ? loginBack : signupBack;

  const eyeBtn = (
    <button
      type="button"
      tabIndex={-1}
      onClick={() => setShowPassword((v) => !v)}
      className={`transition-colors cursor-pointer ${isLight ? "text-slate-400 hover:text-slate-600" : "text-white/30 hover:text-white/60"}`}
    >
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300"
      style={{ background: isLight ? "#f8fafc" : "#000001" }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none scale-105 transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: `url(${currentBg})`,
          opacity: isLight ? 0.45 : 0.35,
        }}
      />
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? "bg-gradient-to-b from-[#f8fafc]/30 via-[#f8fafc]/70 to-[#f8fafc]"
            : "bg-gradient-to-b from-[#000001]/10 via-[#000001]/50 to-[#000001]"
        }`}
      />

      <div className="relative z-10 flex-1 flex flex-col">
        <div
          className={`flex items-center justify-between px-6 py-5 border-b backdrop-blur-sm ${
            isLight
              ? "border-slate-200/80 bg-white/60"
              : "border-white/5 bg-black/20"
          }`}
        >
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
              isLight ? "border-slate-200 bg-slate-100 group-hover:bg-slate-200" : "border-white/10 bg-white/5 group-hover:bg-white/10"
            }`}>
              <ArrowLeft size={15} className={isLight ? "text-slate-700" : "text-white/60"} />
            </div>
            <div className={`flex items-center border rounded-[10px] px-3 py-2.5 overflow-hidden ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#111111] border-white/10"
            }`}>
              <img src={isLight ? logoBlue : logoWhite} alt="Yosh Tadbirkorlar Chempionati" className="h-7 w-auto object-contain" />
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                isLight ? "bg-slate-100 border-slate-200 text-amber-600 hover:bg-slate-200" : "bg-white/5 border-white/10 text-amber-400 hover:bg-white/10"
              }`}
            >
              {isLight ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <span className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-white/30"}`} style={{ fontFamily: "var(--font-button)" }}>
              {mode === "login" ? "Ro'yxatdan o'tish" : "Shaxsiy kabinet"}{" "}
              <button
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); setSuccess(null); }}
                className="text-[#00A8FF] hover:underline cursor-pointer font-semibold"
              >
                {mode === "login" ? "Ro'yxatdan o'ting" : "Kiring"}
              </button>
            </span>
          </div>
        </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1
              className={`text-4xl md:text-5xl font-bold mb-2 ${isLight ? "text-slate-900" : "text-white"}`}
              style={{ fontFamily: "var(--font-zuume)" }}
            >
              {mode === "login" ? (
                <>XUSH <span style={{ color: "#00A8FF" }}>KELIBSIZ</span></>
              ) : (
                <>RO'YXATDAN <span style={{ color: "#00A8FF" }}>O'TISH</span></>
              )}
            </h1>
            <p className={`text-sm ${isLight ? "text-slate-600 font-medium" : "text-white/40"}`} style={{ fontFamily: "var(--font-button)" }}>
              {mode === "login"
                ? "Chempionat portaliga kirish uchun ma'lumotlaringizni kiriting"
                : "Ariza topshirish uchun hisob yarating"}
            </p>
          </div>

          {success ? (
            <div className={`rounded-2xl border p-6 flex flex-col items-center text-center gap-4 ${
                isLight ? "border-emerald-500/30 bg-emerald-50 text-slate-800" : "border-emerald-500/20 bg-emerald-500/5 text-white"
              }`}>
              <CheckCircle2 size={40} className="text-emerald-500" />
              <div>
                <h3 className="font-bold text-lg mb-1">Email yuborildi!</h3>
                <p className={`text-sm ${isLight ? "text-slate-600" : "text-white/60"}`}>{success}</p>
              </div>
              <button
                onClick={() => { setMode("login"); setSuccess(null); }}
                className="mt-2 text-sm text-[#00A8FF] hover:underline cursor-pointer font-semibold"
              >
                Kirishga o'tish →
              </button>
            </div>
          ) : (
            <div className={`rounded-2xl border p-6 sm:p-8 backdrop-blur-sm shadow-xl transition-colors duration-300 ${
                isLight ? "border-slate-200 bg-white/90 shadow-slate-200/60 text-slate-900" : "border-white/8 bg-white/5 text-white"
              }`}>
              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-sm text-red-500">
                  {error}
                </div>
              )}

              {mode === "login" && (
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="flex flex-col gap-4">
                  <InputField
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                    isLight={isLight}
                    error={loginForm.formState.errors.email?.message}
                    {...loginForm.register("email")}
                  />
                  <InputField
                    label="Parol"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    isLight={isLight}
                    error={loginForm.formState.errors.password?.message}
                    rightElement={eyeBtn}
                    {...loginForm.register("password")}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 w-full flex items-center justify-center gap-2 bg-[#00A8FF] hover:bg-[#0090dd] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-3.5 text-sm transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Kirish <ArrowRight size={16} /></>
                    )}
                  </button>
                </form>
              )}

              {mode === "register" && (
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="flex flex-col gap-4">
                  <InputField
                    label="To'liq ism"
                    placeholder="Alisher Navoiy"
                    isLight={isLight}
                    error={registerForm.formState.errors.full_name?.message}
                    {...registerForm.register("full_name")}
                  />
                  <InputField
                     label="Telefon raqam"
                     type="tel"
                     defaultValue="+998("
                     placeholder="+998(90)123-45-67"
                     isLight={isLight}
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
                    isLight={isLight}
                    error={registerForm.formState.errors.email?.message}
                    {...registerForm.register("email")}
                  />
                  <InputField
                    label="Parol"
                    type={showPassword ? "text" : "password"}
                    placeholder="Kamida 6 ta belgi"
                    isLight={isLight}
                    error={registerForm.formState.errors.password?.message}
                    rightElement={eyeBtn}
                    {...registerForm.register("password")}
                  />
                  <InputField
                    label="Parolni tasdiqlang"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    isLight={isLight}
                    error={registerForm.formState.errors.confirm_password?.message}
                    {...registerForm.register("confirm_password")}
                  />
                  <p className={`text-xs leading-relaxed ${isLight ? "text-slate-500" : "text-white/30"}`}>
                    Ro'yxatdan o'tish orqali siz platformaning foydalanish shartlariga rozilik bildirasiz.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-1 w-full flex items-center justify-center gap-2 bg-[#00A8FF] hover:bg-[#0090dd] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-3.5 text-sm transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/20"
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
