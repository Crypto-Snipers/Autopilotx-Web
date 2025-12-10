import React, { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import AuthLayout from "@/components/AuthLayout";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { setSessionItem } from "@/lib/sessionStorageUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignIn() {
  const [_, navigate] = useLocation();
  const { signin } = useAuth();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleGoogleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false,
          queryParams: {
            prompt: "select_account",
            access_type: "offline",
          },
        },
      });
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  async function onSubmit(values: SignInValues) {
    try {
      setSessionItem("signupEmail", values.email);
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      if (data?.user) {
        if (data.user.user_metadata) {
          if (data.user.user_metadata.name)
            setSessionItem("signupName", data.user.user_metadata.name);
          if (data.user.user_metadata.phone)
            setSessionItem("signupPhone", data.user.user_metadata.phone);
        }

        await signin(values.email, values.password);
        navigate("/home");
      } else {
        throw new Error("Failed to retrieve user data");
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsResetting(true);

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;

      setResetSent(true);
      toast({
        title: "Email sent",
        description: "Check your email for the password reset link",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      titleClass="text-lg sm:text-xl"
      subtitleClass="text-xs sm:text-sm"
    >
      {/* Forgot Password Modal */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Reset Password</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {resetSent
                ? "Check your email for the password reset link."
                : "Enter your email and we'll send a reset link."}
            </DialogDescription>
          </DialogHeader>

          {!resetSent ? (
            <div className="grid gap-3 py-3">
              <div className="grid gap-1">
                <Label htmlFor="reset-email" className="text-sm">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={isResetting}
                  className="text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <Button
                  variant="outline"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  disabled={isResetting}
                  className="text-xs sm:text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleForgotPassword}
                  disabled={isResetting || !resetEmail}
                  className="text-xs sm:text-sm"
                >
                  {isResetting ? "Sending..." : "Send Reset Link"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end mt-3">
              <Button
                onClick={() => {
                  setIsForgotPasswordOpen(false);
                  setResetSent(false);
                  setResetEmail("");
                }}
                className="text-xs sm:text-sm"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MAIN FORM CONTAINER */}
      <div className="w-full max-w-sm mx-auto px-4 sm:px-6 md:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-6 sm:mb-8">
          <h1 className="text-base sm:text-lg font-semibold">Sign in</h1>
          <p className="text-xs sm:text-sm text-neutral-600 text-center sm:text-right whitespace-nowrap">
            Don't have an account?{" "}
            <a href="/signup" className="text-[#06a57f] font-medium">
              Sign up
            </a>
          </p>
        </div>

        {/* FORM */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Email / Client ID</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} className="text-sm" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center mb-1">
                    <FormLabel className="text-sm sm:text-base">Password</FormLabel>
                    <button
                      type="button"
                      className="text-xs sm:text-sm text-[#06a57f] hover:underline whitespace-nowrap"
                      onClick={() => setIsForgotPasswordOpen(true)}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="pr-10 text-sm"
                      />
                    </FormControl>

                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Remember Me */}
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      className="mt-1 border-[#06a57f] data-[state=checked]:bg-[#06a57f]"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-xs sm:text-sm cursor-pointer">
                    Remember me
                  </FormLabel>
                </FormItem>
              )}
            />

            {/* Continue Button */}
            <button
              type="submit"
              className="w-full bg-[#06a57f] hover:bg-[#05b289] font-medium text-white text-sm py-2.5 rounded-md transition"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Continue"}
            </button>

            {/* Divider */}
            <div className="flex items-center justify-center">
              <span className="mx-4 text-neutral-400 text-xs sm:text-sm">or</span>
            </div>

            {/* Google */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-background border flex items-center justify-center gap-2 py-2.5 text-sm"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-4 h-4"
                alt="Google"
              />
              Sign in with Google
            </Button>
          </form>
        </Form>
      </div>
    </AuthLayout>
  );
}
