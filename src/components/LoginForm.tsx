"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";

export function LoginForm() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isLoading) return;

    if (!userName.trim() || !password.trim()) {
      toast.error("Username dan password wajib diisi.");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);
    toast.success(`Selamat datang, ${userName.trim()}`);
  };

  return (
    <div className="w-full max-w-sm">
      <h2 className="font-[family-name:var(--font-montserrat)] text-2xl font-bold text-matte-black uppercase tracking-wide mb-10 text-center">
        Login
      </h2>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="username"
            className="block text-[11px] font-[family-name:var(--font-montserrat)] font-bold text-matte-black uppercase tracking-widest mb-2"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="input-field"
            placeholder="Masukkan username"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-[11px] font-[family-name:var(--font-montserrat)] font-bold text-matte-black uppercase tracking-widest mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleLogin();
              }}
              autoComplete="current-password"
              className="input-field pr-11"
              placeholder="Masukkan password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-gray hover:text-primary-pink transition-colors"
            >
              {showPassword ? (
                <EyeOff size={18} strokeWidth={1.75} />
              ) : (
                <Eye size={18} strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleLogin()}
          disabled={isLoading}
          className="btn-primary w-full text-xs disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? "Memproses..." : "Login"}
        </button>
      </div>
    </div>
  );
}
