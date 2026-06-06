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
  ArrowLeft
} from 'lucide-react';
import api from '@/services/api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/agenda');
    } catch (err: any) {
      console.error('Login error:', err);
      alert(err.response?.data?.message || 'E-mail ou senha incorretos.');
    } finally {
      setIsLoading(false);
    }
  };


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

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@wiseapp.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Senha</label>
                <a href="#" className="text-[10px] font-bold text-primary hover:underline">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
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
