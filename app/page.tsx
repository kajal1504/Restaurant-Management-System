"use client";

import React, { useState } from "react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UtensilsCrossed, AlertCircle, Eye, EyeOff, Loader2 as Spinner } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Reset Password State
  const [resetEmail, setResetEmail] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const { login, resetPassword, loading: isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    const newPass = await resetPassword(resetEmail);
    setGeneratedPassword(newPass);
    setIsResetting(false);
  };

  if (showForgotPassword) {
    return (
      <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-md shadow-2xl relative z-10 transition-all duration-300">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-white drop-shadow-md">Reset Password</CardTitle>
          <CardDescription className="text-white/80">
            Enter your email to generate a new temporary password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!generatedPassword ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-white">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isResetting}>
                {isResetting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : "Generate New Password"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-white/60 hover:text-white hover:bg-white/10"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Login
              </Button>
            </form>
          ) : (
            <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
              <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30">
                <p className="text-sm text-green-200 mb-2">New Password Generated:</p>
                <p className="text-2xl font-mono font-bold text-white tracking-wider select-all cursor-text bg-black/20 p-2 rounded">
                  {generatedPassword}
                </p>
              </div>
              <p className="text-sm text-white/60">
                Please use this password to login. You can change it later in settings.
              </p>
              <Button
                onClick={() => {
                  setShowForgotPassword(false);
                  setEmail(resetEmail);
                  setPassword(generatedPassword);
                }}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (

    <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-md shadow-2xl relative z-10">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UtensilsCrossed className="h-7 w-7" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-white drop-shadow-md">Welcome back</CardTitle>
        <CardDescription className="text-white/80">
          Sign in to TableFlow to manage your restaurant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              // This onChange ensures you can type in the box
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-black/20 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white">Password</Label>
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-black/20 border-white/10 text-white placeholder:text-white/40 pr-10 focus-visible:ring-white/20"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Dont have an account? </span>
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign Up
          </Link>
        </div>
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-white/60 text-center mb-3">Demo credentials:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-white/5 border border-white/10">
              <p className="font-medium text-white">Admin</p>
              <p className="text-white/60">admin@tableflow.com</p>
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/10">
              <p className="font-medium text-white">Waiter</p>
              <p className="text-white/60">waiter@tableflow.com</p>
            </div>
          </div>
          <p className="text-xs text-white/60 text-center mt-2">Password: password123</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: `url('/dashboard_shadow_bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Shadow Overlay (Vignette) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)] pointer-events-none" />

        {/* Linear Gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/40 to-black/60 backdrop-blur-sm pointer-events-none" />

        <LoginForm />
      </div>
    </AuthProvider>
  );
}