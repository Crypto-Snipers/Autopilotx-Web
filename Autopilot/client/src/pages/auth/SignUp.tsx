import React from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import AuthLayout from "@/components/AuthLayout";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { setSessionItem } from "@/lib/sessionStorageUtils";
import { useToast } from "@/hooks/use-toast";

const signUpSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(1, { message: "Name is required" }),
  phone: z
    .string()
    .min(10, { message: "Please enter a valid phone number" })
    .max(10, { message: "Please enter a valid phone number" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      phone: "",
    },
  });

  async function onSubmit(values: SignUpValues) {
    try {
      setIsLoading(true);

      // 🔍 check if user exists already
      try {
        const response = await fetch(`/api/auth/user?email=${encodeURIComponent(values.email)}`);
        const userData = await response.json();

        if (userData.status === "user_exists") {
          toast({
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
          });
          setIsLoading(false);
          return;
        }
      } catch (checkError) {
        console.log("Error checking if user exists", checkError);
      }

      const userData = { name: values.name, email: values.email, phone: values.phone, password: values.password };
      setSessionItem("userData", userData);

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: "",
          data: {
            name: values.name,
            phone: values.phone,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Account exists",
            description: "An account with this email already exists. Please sign in.",
          });
          setIsLoading(false);
          return;
        }
        throw error;
      }

      if (!data || !data.user) {
        toast({
          title: "Error",
          description: "There was an issue creating your account.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      navigate("/auth/otp-verification");
    } catch (error: any) {
      toast({
        title: "Error during signup",
        description: error.message || "Unexpected error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }

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
      console.error("Google sign-in exception:", error);
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Enter your details to get started">
      <div className="w-full max-w-md md:max-w-lg mx-auto px-4 sm:px-6 md:px-8">

        {/* 🔧 Updated to prevent stretching on small screens */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold">Sign up</h1>
          <p className="text-sm sm:text-base text-neutral-600 text-center sm:text-right">
            Already an account?{" "}
            <a href="/signin" className="text-[#06a57f] font-medium">
              Sign in
            </a>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter your Email id</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 XXX-XX-YY-YYY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="pr-10"
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button
              type="submit"
              className="w-full bg-[#06a57f] hover:bg-[#05b289] font-medium text-white px-4 py-2 sm:py-2.5 rounded-md transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Sign Up"}
            </button>

            <div className="flex items-center justify-center">
              <span className="mx-4 text-neutral-400 text-sm">or</span>
            </div>

            <Button
              type="button"
              className="w-full bg-background border hover:bg-[#06a57f] flex items-center justify-center gap-2 py-2 sm:py-2.5"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign up with Google
            </Button>
          </form>
        </Form>
      </div>
    </AuthLayout>
  );
}
