"use client";

import { FC, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Label } from "../ui/label";

interface SignupFormProps {}

const FormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z.string().min(8, "Password must have at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const SignupForm: FC<SignupFormProps> = ({}) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Something went wrong");
        return;
      }

      toast.success("Account created successfully!");

      // Automatically sign in the user
      const signInData = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (signInData?.error) {
        toast.error("Account created but login failed. Please sign in manually.");
        router.push("/sign-in");
      } else {
        toast.success("Logged in successfully!");
        router.push("/dashboard/properties");
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const popupCenter = (
    url: string | URL | undefined,
    title: string | undefined
  ) => {
    const dualScreenLeft = window.screenLeft ?? window.screenX;
    const dualScreenTop = window.screenTop ?? window.screenY;

    const width =
      window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;

    const height =
      window.innerHeight ??
      document.documentElement.clientHeight ??
      screen.height;

    const systemZoom = width / window.screen.availWidth;

    const left = (width - 500) / 2 / systemZoom + dualScreenLeft;
    const top = (height - 550) / 2 / systemZoom + dualScreenTop;

    const newWindow = window.open(
      url,
      title,
      `width=${500 / systemZoom},height=${
        550 / systemZoom
      },top=${top},left=${left}`
    );

    newWindow?.focus();
  };

  return (
    <div className={cn("flex flex-col gap-6 shadow-xl rounded-lg ")}>
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-2xl items-center">
            <Link href="/" className="flex items-center text-center mr-2">
              <Image src="/icon.svg" width={20} height={20} alt="logo" />
              <h1 className="ms-2 font-semibold">House</h1>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...form.register("name")}
                  disabled={isLoading}
                />
                <p className="text-sm text-red-500">
                  {form.formState.errors.name?.message}
                </p>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...form.register("email")}
                  disabled={isLoading}
                />
                <p className="text-sm text-red-500">
                  {form.formState.errors.email?.message}
                </p>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...form.register("password")}
                  disabled={isLoading}
                />
                <p className="text-sm text-red-500">
                  {form.formState.errors.password?.message}
                </p>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  {...form.register("confirmPassword")}
                  disabled={isLoading}
                />
                <p className="text-sm text-red-500">
                  {form.formState.errors.confirmPassword?.message}
                </p>
              </div>
              <Button type="submit" className="w-full border" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
              <p className="text-gray-400 text-center my-2">
                Or sign up with
              </p>

              <Button
                type="button"
                variant={"ghost"}
                onClick={() => popupCenter("/google-signin", "Sample Sign In")}
                className="w-full bg-white border mb-2 flex items-center justify-center"
                disabled={isLoading}
              >
                <Image
                  src={"/google.png"}
                  alt="google"
                  width={18}
                  height={18}
                  className="mr-2"
                />
                Sign up with Google
              </Button>
            </div>
            <div className="mt-2 text-center text-sm">
              Already have an account?{" "}
              <a href="/sign-in" className="underline underline-offset-4">
                Sign in
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupForm;
