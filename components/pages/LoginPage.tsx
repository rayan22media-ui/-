import React, { useState } from 'react';
import { RegistrationData } from '../../App';
import { GOVERNORATES } from '../../constants';
import { useToast } from '../Toast';

interface LoginPageProps {
  onLogin: (email: string, password: string) => boolean;
  onRegister: (userData: RegistrationData) => boolean;
  onNavigateToHome: () => void;
}

const Logo: React.FC<{ classNames?: string }> = ({ classNames }) => (
    <div className={`flex items-center gap-2 justify-center ${classNames}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white text-xl font-bold">و</span>
        </div>
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            وين للمقايضة
        </span>
    </div>
);

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister, onNavigateToHome }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('ali@example.com');
  const [loginPassword, setLoginPassword] = useState('123');
  
  // Register State
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [governorate, setGovernorate] = useState(GOVERNORATES[0]);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  
  const { addToast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(loginEmail, loginPassword);
    if (!success) {
      addToast('error', 'فشل الدخول', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    }
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
        addToast('error', 'خطأ في التسجيل', 'كلمتا المرور غير متطابقتين.');
        return;
    }
    // Simple Syrian phone number validation
    if (!/^09\d{8}$/.test(phone)) {
        addToast('error', 'خطأ في التسجيل', 'الرجاء إدخال رقم هاتف سوري صالح (مثال: 0912345678).');
        return;
    }

    onRegister({
        name,
        email: registerEmail,
        password: registerPassword,
        phone,
        governorate,
        avatarUrl: avatarUrl || `https://picsum.photos/seed/${registerEmail}/200/200` // Default avatar
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        const reader = new FileReader();
        reader.onload = (event) => setAvatarUrl(event.target!.result as string);
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  const inputStyle = "w-full py-3 px-4 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-slate-800 placeholder:text-slate-400";
  const labelStyle = "block text-sm font-bold text-slate-600 mb-2";
  
  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-6">
        <div>
            <label htmlFor="login-email" className={labelStyle}>البريد الإلكتروني</label>
            <input id="login-email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className={inputStyle} placeholder="you@example.com" required />
        </div>
        <div>
            <label htmlFor="login-password" className={labelStyle}>كلمة المرور</label>
            <input id="login-password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className={inputStyle} placeholder="••••••••" required />
        </div>
        <div>
            <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3.5 px-6 rounded-full hover:bg-purple-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg hover:scale-105">
                دخول
            </button>
        </div>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="space-y-4">
        <div>
             <label className={labelStyle}>الصورة الشخصية (اختياري)</label>
             <div className="flex items-center gap-4">
                 <label htmlFor="avatar-upload" className="cursor-pointer">
                    {avatarUrl ? (
                         <img src={avatarUrl} alt="Avatar Preview" className="w-16 h-16 rounded-full object-cover border-2 border-purple-200" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed flex items-center justify-center">
                            <svg className="w-8 h-8 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                        </div>
                    )}
                 </label>
                 <input id="avatar-upload" type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                 <button type="button" onClick={() => document.getElementById('avatar-upload')?.click()} className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-slate-200 transition">اختر صورة</button>
             </div>
        </div>
        <div>
            <label htmlFor="name" className={labelStyle}>الاسم الكامل</label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputStyle} placeholder="مثال: علي الأحمد" required />
        </div>
        <div>
            <label htmlFor="register-email" className={labelStyle}>البريد الإلكتروني</label>
            <input id="register-email" type="email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} className={inputStyle} placeholder="you@example.com" required />
        </div>
         <div>
            <label htmlFor="phone" className={labelStyle}>رقم الموبايل السوري</label>
            <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputStyle} placeholder="09xxxxxxxx" pattern="^09\d{8}$" title="يجب أن يكون الرقم من 10 خانات ويبدأ بـ 09" required />
        </div>
         <div>
            <label htmlFor="governorate" className={labelStyle}>المحافظة</label>
            <select id="governorate" value={governorate} onChange={e => setGovernorate(e.target.value)} className={inputStyle}>
              {GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
            </select>
         </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="register-password" className={labelStyle}>كلمة المرور</label>
                <input id="register-password" type="password" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} className={inputStyle} placeholder="••••••••" required />
            </div>
            <div>
                <label htmlFor="confirm-password" className={labelStyle}>تأكيد كلمة المرور</label>
                <input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputStyle} placeholder="••••••••" required />
            </div>
        </div>
        <div>
            <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3.5 px-6 rounded-full hover:bg-purple-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg hover:scale-105">
                إنشاء حساب
            </button>
        </div>
    </form>
  );


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          <Logo classNames="mb-6" />
          <div className="text-center mb-8">
             <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h1>
             <p className="text-slate-500 mt-2">{mode === 'login' ? 'مرحباً بعودتك! أكمل مقايضاتك.' : 'انضم إلينا وابدأ المقايضة اليوم.'}</p>
          </div>
          
          {mode === 'login' ? renderLoginForm() : renderRegisterForm()}

          <div className="text-center mt-6 text-sm">
             <p className="text-slate-500">
                {mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                <button 
                    onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); }} 
                    className="font-bold text-purple-600 hover:text-purple-800 transition mr-1"
                >
                    {mode === 'login' ? 'أنشئ حساباً' : 'سجل الدخول'}
                </button>
             </p>
          </div>
        </div>
         <div className="text-center mt-6">
            <button onClick={onNavigateToHome} className="text-slate-600 hover:text-purple-700 font-semibold transition">
                أو العودة إلى الصفحة الرئيسية
            </button>
         </div>
      </div>
    </div>
  );
};

export default LoginPage;