"use client";

import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { loginUser } from "@/features/auth/authActions";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import LogoWithName from "@/components/common/LogoWithName/LogoWithName";

const formSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const res = await dispatch(loginUser(values));
    if (res.success && res.user?.role) {
      toast.success("Login Successful.");
      router.push(`/dashboard/${res.user.role}`);
    } else {
      toast.error(res.message || "Login failed!");
    }
  };

  return (
    <div>
      <div className=" bg-gray-50 dark:bg-gray-900 ">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="-mt-40 mb-10 mr-12">
            <LogoWithName />
          </div>
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-2">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Login to Your Account
            </h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email
                        <span className="text-red-600 font-bold -ml-1.5">
                          *
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
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
                      <FormLabel>
                        Password
                        <span className="text-red-600 font-bold -ml-1.5">
                          *
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="******"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full cursor-pointer">
                  Login
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
