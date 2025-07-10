"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { login, register } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Spinner from "./ui/spinner";
import { useUser } from "@/lib/useAuth";
import { useRouter } from "next/navigation";

export function AuthForm({
  type,
  className,
  ...props
}: {
  type: "login" | "register";
  className?: string;
}) {
  const { user, loading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous error
    try {
      setIsLoading(true);
      let data;
      if (type === "login") data = await login(email, password);
      else data = await register(email, password);
      // Store accessToken and refreshToken in HTTP-only cookies
      Cookies.set("accessToken", data.accessToken, {
        expires: 1,
        secure: true,
        sameSite: "Strict",
      });
      // Cookies.set("refreshToken", data.refreshToken, {
      //   expires: 7,
      //   secure: true,
      //   sameSite: "Strict",
      // });

      // Redirect to dashboard or home page
      window.location.href = "/";
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Authentication failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || user)
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <Spinner />
      </div>
    );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>
            {type === "login" ? "Login" : "Sign up"} to your account
          </CardTitle>
          <CardDescription>
            Enter your email below to {type === "login" ? "Login" : "Sign up"}{" "}
            to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Error Handling with ShadCN Alert */}
              {error && (
                <Alert variant="destructive" className="mt-1">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full mt-4"
                disabled={isLoading}
              >
                {isLoading && <Spinner />}{" "}
                {type === "login" ? "Login" : "Sign up"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a
                href={type === "login" ? "/register" : "/login"}
                className="underline underline-offset-4"
              >
                {type === "login" ? "Sign up" : "Login"}
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
