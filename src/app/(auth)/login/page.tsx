"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+86");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleSendCode = async () => {
    const expectedLength = countryCode === "+86" ? 11 : 8;
    if (!phone || phone.length !== expectedLength) return;
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        phone: `${countryCode}${phone}`,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      setCodeSent(true);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError("发送验证码失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !code) return;
    setError("");
    setLoading(true);

    try {
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        phone: `${countryCode}${phone}`,
        token: code,
        type: "sms",
      });

      if (verifyError) {
        setError("验证码错误或已过期");
        setLoading(false);
        return;
      }

      if (verifyData.user) {
        await supabase.from("users").upsert(
          { id: verifyData.user.id, phone: `+86${phone}` },
          { onConflict: "id" }
        );
      }

      window.location.href = "/dashboard";
    } catch {
      setError("登录失败，请稍后重试");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl font-bold text-primary">AI</span>
            <span className="text-2xl font-bold text-foreground">提名官</span>
          </Link>
          <p className="mt-2 text-muted">登录 / 注册</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl border border-border p-8 space-y-6"
        >
          {error && (
            <div className="bg-danger/10 text-danger text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-foreground mb-2"
            >
              手机号
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value);
                  setPhone("");
                }}
                className="px-3 py-3 rounded-lg border border-border text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
              >
                <option value="+86">🇨🇳 +86</option>
                <option value="+853">🇲🇴 +853</option>
                <option value="+852">🇭🇰 +852</option>
                <option value="+1">🇺🇸 +1</option>
              </select>
              <input
                id="phone"
                type="tel"
                maxLength={countryCode === "+86" ? 11 : 10}
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="flex-1 px-4 py-3 rounded-lg border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-foreground mb-2"
            >
              验证码
            </label>
            <div className="flex gap-3">
              <input
                id="code"
                type="text"
                maxLength={6}
                placeholder="请输入验证码"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="flex-1 px-4 py-3 rounded-lg border border-border text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0 || phone.length < 7 || loading}
                className="px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-primary-light text-primary hover:bg-primary/20"
              >
                {countdown > 0 ? `${countdown}s` : codeSent ? "重新发送" : "获取验证码"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !phone || !code}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "登录中..." : "登录 / 注册"}
          </button>

          <p className="text-xs text-center text-muted">
            未注册的手机号将自动创建账号
          </p>
        </form>
      </div>
    </div>
  );
}
