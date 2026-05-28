import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants';

interface FormState { username: string; password: string; }
interface FormErrors { username?: string; password?: string; general?: string; }

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [form, setForm]       = useState<FormState>({ username: '', password: '' });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.role === 'BOSS')         navigate(ROUTES.DASHBOARD);
      else if (user.role === 'MANAGER')  navigate(ROUTES.DASHBOARD);
      else if (user.role === 'CHEF')     navigate(ROUTES.KDS);
      else navigate(ROUTES.POS);
    }
  }, [isLoggedIn, user, navigate]);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.username.trim()) errs.username = 'Vui lòng nhập tên đăng nhập';
    if (!form.password)        errs.password = 'Vui lòng nhập mật khẩu';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      const res = await authService.login({ username: form.username.trim(), password: form.password });
      authService.saveSession(res.token, res.user);
      // Role-based routing
      if (res.user.role === 'BOSS')         navigate(ROUTES.DASHBOARD);
      else if (res.user.role === 'MANAGER')  navigate(ROUTES.DASHBOARD);
      else if (res.user.role === 'CHEF')     navigate(ROUTES.KDS);
      else navigate(ROUTES.POS);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
      setErrors({ general: 'Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại.' });
      // Giữ lại username, xóa password (AC-5.2)
      setForm((f) => ({ ...f, password: '' }));
      console.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>
      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col items-center justify-center p-12 relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: 'url("/images/login_bg.png")' }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

        {/* Glowing decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--color-primary)' }} />
        <div className="absolute bottom-[-40px] left-[-40px] w-80 h-80 rounded-full opacity-15 blur-2xl"
          style={{ background: 'var(--color-primary)' }} />

        <div className="relative z-10 text-center max-w-lg">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-2xl backdrop-blur-md bg-white/10 border border-white/20">
            <span className="material-symbols-outlined text-white text-4xl">restaurant</span>
          </div>
          <h1 className="text-5xl font-black mb-3 text-white tracking-tight drop-shadow-sm">ProPOS</h1>
          <p className="text-lg text-orange-100 font-medium drop-shadow-sm">
            Hệ thống Quản lý Chuỗi Nhà hàng Chuyên nghiệp
          </p>

          <div className="mt-16 grid grid-cols-3 gap-5 text-center">
            {[
              { icon: 'storefront',      label: 'Quản lý Chi nhánh' },
              { icon: 'restaurant_menu', label: 'Thực đơn thông minh' },
              { icon: 'point_of_sale',   label: 'POS Nhanh chóng' },
            ].map((f) => (
              <div key={f.label} className="bg-white/10 rounded-2xl p-4 backdrop-blur-lg border border-white/10 hover:bg-white/15 transition-all duration-300">
                <span className="material-symbols-outlined text-3xl text-orange-300">
                  {f.icon}
                </span>
                <p className="text-xs mt-2 font-semibold text-white">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12"
        style={{ background: 'var(--color-surface)' }}>
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ background: 'var(--color-primary)' }}>P</div>
              <span className="font-extrabold text-xl" style={{ color: 'var(--color-text-primary)' }}>ProPOS</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Đăng nhập</h2>
          <p className="text-sm mb-7" style={{ color: 'var(--color-text-secondary)' }}>
            Chào mừng trở lại. Vui lòng đăng nhập để tiếp tục.
          </p>

          {/* General error */}
          {errors.general && (
            <div className="flex items-start gap-2 p-3 rounded-lg mb-5 text-sm"
              style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
              <span className="material-symbols-outlined text-base mt-0.5">error</span>
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Username */}
            <div>
              <label className="label" htmlFor="login-username">Tên đăng nhập / Email</label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                className={`input ${errors.username ? 'error' : ''}`}
                placeholder="Nhập tên đăng nhập..."
                value={form.username}
                onChange={onChange('username')}
              />
              {errors.username && (
                <p className="field-error"><span className="material-symbols-outlined text-sm">error</span>{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="login-password">Mật khẩu</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input pr-11 ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={onChange('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon w-7 h-7"
                  aria-label="Ẩn/hiện mật khẩu"
                >
                  <span className="material-symbols-outlined text-base">
                    {showPw ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="field-error"><span className="material-symbols-outlined text-sm">error</span>{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 mt-2"
            >
              {loading
                ? <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Đang đăng nhập...</>
                : 'Đăng nhập'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
