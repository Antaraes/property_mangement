"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "c:/Users/User/Downloads/Fillcreative-main/Fillcreative-main/src/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface SigninFormProps {}

const FormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(8, "Password must have at least 8 characters"),
});

const SigninForm: FC<SigninFormProps> = ({}) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const popupCenter = (url: string | URL | undefined, title: string | undefined) => {
    const dualScreenLeft = window.screenLeft ?? window.screenX;
    const dualScreenTop = window.screenTop ?? window.screenY;

    const width = window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;

    const height = window.innerHeight ?? document.documentElement.clientHeight ?? screen.height;

    const systemZoom = width / window.screen.availWidth;

    const left = (width - 500) / 2 / systemZoom + dualScreenLeft;
    const top = (height - 550) / 2 / systemZoom + dualScreenTop;

    const newWindow = window.open(
      url,
      title,
      `width=${500 / systemZoom},height=${550 / systemZoom},top=${top},left=${left}`
    );

    newWindow?.focus();
  };

  const router = useRouter();
  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const signInData = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (signInData?.error) {
      toast.error(signInData.error);
    } else {
      router.push("/dashboard/properties");
    }
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...form.register("email")}
                />
                <p className="text-sm text-red-500">{form.formState.errors.email?.message}</p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...form.register("password")}
                />
                <p className="text-sm text-red-500">{form.formState.errors.password?.message}</p>
              </div>
              <Button type="submit" className="w-full border">
                Login
              </Button>
              <p className="text-gray-400 text-center my-2">Or sign up with email</p>

              <Button
                type="button"
                variant={"ghost"}
                onClick={() => popupCenter("/google-signin", "Sample Sign In")}
                className="w-full bg-white border mb-2 flex items-center justify-center"
              >
                <Image src={"/google.png"} alt="google" width={18} height={18} className="mr-2" />
                Login with Google
              </Button>
            </div>
            <div className="mt-2 text-center text-sm">
              Don&apos;t you have an account?{" "}
              <a href="/sign-up" className="underline underline-offset-4">
                Signup
              </a>
            </div>
          </form>
          {/* <GoogleSignin /> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default SigninForm;
