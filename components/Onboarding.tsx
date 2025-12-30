
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Icons } from '../constants';

interface OnboardingProps {
  onComplete: (user: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    email: '',
    bio: '',
    location: '',
    theme: 'light',
    joinedAt: new Date().toISOString(),
    securityPin: ''
  });
  
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    // Try to get location automatically
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({ ...prev, location: `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}` }));
        },
        () => {} // Silent fail is fine
      );
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const next = () => setStep(prev => prev + 1);
  const back = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
    onComplete({ ...formData, securityPin: pin });
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-black z-[100] flex flex-col items-center justify-center p-8 transition-colors duration-500">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-blue-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </div>
          <h1 className="text-4xl font-bold dark:text-white">Journal</h1>
          <p className="text-gray-500 dark:text-gray-400">Capture your moments beautifully.</p>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-xl space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold dark:text-white">Let's get to know you</h2>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="w-full px-5 py-4 bg-gray-100 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={formData.name}
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full px-5 py-4 bg-gray-100 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={formData.email}
                onChange={handleChange}
              />
              <button 
                onClick={next}
                disabled={!formData.name || !formData.email}
                className="w-full py-4 bg-blue-500 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/30 active:scale-95 transition-all disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold dark:text-white">Tell us more</h2>
              <input
                type="text"
                name="location"
                placeholder="Location"
                className="w-full px-5 py-4 bg-gray-100 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={formData.location}
                onChange={handleChange}
              />
              <textarea
                name="bio"
                placeholder="Short bio (e.g., Aspiring writer, Nature lover)"
                rows={3}
                className="w-full px-5 py-4 bg-gray-100 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white resize-none"
                value={formData.bio}
                onChange={handleChange}
              />
              <div className="flex space-x-2">
                <button onClick={back} className="w-1/3 py-4 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white rounded-2xl font-semibold">Back</button>
                <button 
                  onClick={next}
                  className="w-2/3 py-4 bg-blue-500 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

           {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                 <div className="text-blue-500"><Icons.Lock /></div>
                 <h2 className="text-xl font-semibold dark:text-white">Secure your journal</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create a 4-digit PIN to keep your thoughts private.</p>
              
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                className="w-full px-5 py-4 bg-gray-100 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-center tracking-[1em] font-mono text-lg"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
              />
              
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Confirm PIN"
                className="w-full px-5 py-4 bg-gray-100 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-center tracking-[1em] font-mono text-lg"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
              />

              <div className="flex space-x-2">
                <button onClick={back} className="w-1/3 py-4 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white rounded-2xl font-semibold">Back</button>
                <button 
                  onClick={handleSubmit}
                  disabled={pin.length !== 4 || pin !== confirmPin}
                  className="w-2/3 py-4 bg-blue-500 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Finish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
