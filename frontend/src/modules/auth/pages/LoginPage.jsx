import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Mail, User, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import useAuthStore from '../store/authStore';

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, register, isLoading, error } = useAuthStore();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('admin@meridian.vn');
  const [password, setPassword] = useState('Password@123');
  const [fullName, setFullName] = useState('Nguyễn Lê Hải');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      if (isRegisterMode) {
        await register(email, password, fullName);
        alert('Đăng ký thành công! Hãy đăng nhập với thông tin vừa tạo.');
        setIsRegisterMode(false);
      } else {
        await login(email, password);
        navigate('/app/studio');
      }
    } catch (err) {
      setFormError(err.message || 'Thao tác không thành công.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#070a12] p-4 relative overflow-hidden font-sans">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0f172a]/90 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 text-white shadow-lg shadow-purple-900/40">
            <Sparkles size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-100 tracking-tight">
            Meridian Horizon
          </h1>
          <p className="text-xs text-gray-400">
            {isRegisterMode
              ? 'Tạo tài khoản mới cho Studio Lồng tiếng Video'
              : 'Đăng nhập vào Studio Biên dịch & Lồng tiếng Video AI'}
          </p>
        </div>

        {/* Error Alert */}
        {(formError || error) && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-lg text-xs text-rose-300">
            {formError || error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <Input
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<User size={16} />}
              required
            />
          )}

          <Input
            label="Địa chỉ Email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            required
          />

          <Input
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            helperText={
              isRegisterMode
                ? 'Tối thiểu 8 ký tự, gồm chữ in hoa, chữ thường, số và ký tự đặc biệt.'
                : undefined
            }
            required
          />

          <Button
            type="submit"
            className="w-full py-2.5 mt-2"
            isLoading={isLoading}
            variant="primary"
          >
            {isRegisterMode ? 'Đăng ký tài khoản' : 'Đăng nhập Studio'}
          </Button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-2 border-t border-gray-800">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setFormError('');
            }}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors"
          >
            {isRegisterMode
              ? 'Đã có tài khoản? Đăng nhập ngay'
              : 'Chưa có tài khoản? Tạo tài khoản mới'}
          </button>
        </div>

        {/* Security Footer Notice */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
          <ShieldCheck size={12} className="text-emerald-400" />
          <span>Bảo mật đa tầng: Mã hóa bcrypt, JWT kép và chống brute-force</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
