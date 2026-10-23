'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import api from '@/services/api';
import { RequiredMark } from '@/components/ui/RequiredMark';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = 'Informe o e-mail.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = 'E-mail inválido.';
    if (!password) newErrors.password = 'Informe a senha.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/agenda');
    } catch (err: any) {
      console.error('Login error:', err);
      if (!err.response) {
        setErrors({ password: 'Não foi possível conectar ao servidor. Tente novamente.' });
      } else if (err.response.status === 401) {
        setErrors({ email: ' ', password: 'E-mail ou senha incorretos.' });
      } else {
        const msg = err.response.data?.message;
        setErrors({ password: Array.isArray(msg) ? msg[0] : msg || 'Erro ao fazer login.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (hasError: boolean, paddingRight = 'pr-4') =>
    `w-full pl-10 ${paddingRight} py-2.5 rounded-lg text-sm outline-none transition-all placeholder:text-slate-400 font-medium border ${
      hasError
        ? 'bg-red-50/50 border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400'
        : 'bg-slate-50 border-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary'
    }`;

  const FieldError = ({ message }: { message?: string }) =>
    message && message.trim() ? (
      <p className="flex items-center gap-1.5 text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        {message}
      </p>
    ) : null;


  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">

      {/* Background Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao início
      </Link>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left Pane: Branding Presentation */}
        <div className="bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          {/* Subtle overlay grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-[80px]" />

          {/* Logo */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary-dim shadow-lg shadow-primary/20">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">Wise App</span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight font-headline">Acesse a sua conta corporativa</h2>
            <p className="text-slate-400 text-sm font-light leading-relaxed">Simplifique as operações do seu escritório com controle centralizado, finanças transparentes e gestão operacional automatizada.</p>
          </div>

          {/* Bottom */}
          <div className="text-xs text-slate-500 font-mono relative z-10">
            Secure SSL Encryption — HIPAA Compliant
          </div>
        </div>

        {/* Right Pane: Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center space-y-8 bg-white">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900 font-headline">Fazer Login</h1>
            <p className="text-xs text-on-surface-variant font-medium">Informe suas credenciais para acessar a plataforma.</p>
          </div>

          <form onSubmit={handleLogin} noValidate className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">E-mail Corporativo <RequiredMark /></label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.email ? 'text-red-400' : 'text-on-surface-variant'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email || errors.password) setErrors({});
                  }}
                  placeholder="admin@wiseapp.com"
                  aria-invalid={!!errors.email}
                  className={inputClass(!!errors.email)}
                />
              </div>
              <FieldError message={errors.email} />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Senha <RequiredMark /></label>

              </div>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.password ? 'text-red-400' : 'text-on-surface-variant'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.email || errors.password) setErrors({});
                  }}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  className={inputClass(!!errors.password, 'pr-10')}
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldError message={errors.password} />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Autenticando...' : 'Entrar na Conta'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>


        </div>

      </div>
    </div>
  );
}
