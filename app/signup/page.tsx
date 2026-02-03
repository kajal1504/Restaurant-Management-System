"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UtensilsCrossed, AlertCircle, Eye, EyeOff, Loader2 as Spinner } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [role, setRole] = useState("staff");
      const [showPassword, setShowPassword] = useState(false);

      const { signup, loading: isLoading, error } = useAuth();

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            await signup(email, password, role);
      };

      return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
                  <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                  <Card className="w-full max-w-md border-border bg-card shadow-2xl relative z-10">
                        <CardHeader className="space-y-1 text-center">
                              <div className="flex justify-center mb-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                          <UtensilsCrossed className="h-7 w-7" />
                                    </div>
                              </div>
                              <CardTitle className="text-2xl font-bold text-foreground">Create an Account</CardTitle>
                              <CardDescription className="text-muted-foreground">
                                    Get started with TableFlow
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
                                          <Label htmlFor="email" className="text-foreground">Email</Label>
                                          <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                                          />
                                    </div>

                                    <div className="space-y-2">
                                          <Label htmlFor="role" className="text-foreground">Role</Label>
                                          <Select value={role} onValueChange={setRole}>
                                                <SelectTrigger className="bg-input border-border text-foreground">
                                                      <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                      <SelectItem value="admin">Admin</SelectItem>
                                                      <SelectItem value="manager">Manager</SelectItem>
                                                      <SelectItem value="staff">Staff</SelectItem>
                                                      <SelectItem value="waiter">Waiter</SelectItem>
                                                      <SelectItem value="kitchen">Kitchen</SelectItem>
                                                      <SelectItem value="cashier">Cashier</SelectItem>
                                                </SelectContent>
                                          </Select>
                                    </div>

                                    <div className="space-y-2">
                                          <Label htmlFor="password" className="text-foreground">Password</Label>
                                          <div className="relative">
                                                <Input
                                                      id="password"
                                                      type={showPassword ? "text" : "password"}
                                                      placeholder="Create a password"
                                                      value={password}
                                                      onChange={(e) => setPassword(e.target.value)}
                                                      required
                                                      className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
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
                                                      Creating account...
                                                </>
                                          ) : (
                                                "Sign Up"
                                          )}
                                    </Button>
                              </form>
                              <div className="mt-6 text-center text-sm">
                                    <span className="text-muted-foreground">Already have an account? </span>
                                    <Link href="/" className="text-primary hover:underline font-medium">
                                          Sign In
                                    </Link>
                              </div>
                        </CardContent>
                  </Card>
            </div>
      );
}
