import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginUser } from "@/api/AuthApi";
import { LoginForm, loginFormSchema } from "@/lib/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AtSign, SquareAsterisk } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginFormSchema),
  });
  const { loginUser, isPending } = useLoginUser();

  const onSubmit = async (data: LoginForm) => {
    loginUser(data);
  };

  return (
    <div className="w-screen h-screen bg-gray-200 flex items-center justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white rounded-md shadow px-8 py-6 flex flex-col gap-3 h-full md:h-auto"
        >
          <h1 className="text-4xl tracking-tight font-extrabold mb-6">
            Login Page
          </h1>
          <div
            className={`gap-2 flex items-center border-2 rounded-full px-3 ${
              form.formState.errors.email && "border-red-500"
            }`}
          >
            <FormLabel>
              <AtSign />
            </FormLabel>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="Enter Email"
                      {...field}
                      className="border-none shadow-none focus-visible:ring-0 text-lg"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormMessage>{form.formState.errors?.email?.message}</FormMessage>
          <div
            className={`gap-2 flex items-center border-2 rounded-full px-3 ${
              form.formState.errors.password && "border-red-500"
            }`}
          >
            <FormLabel>
              <SquareAsterisk />
            </FormLabel>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="Enter Password"
                      {...field}
                      className="border-none shadow-none focus-visible:ring-0 text-lg"
                      type="password"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormMessage>{form.formState.errors?.password?.message}</FormMessage>
          <Button className="mt-4" type="submit" disabled={isPending}>
            Login
          </Button>
          <Link to="/signup">Want to signup</Link>
          <Link to="/forgot-password" className="font-medium text-red-600">
            Forgot Your Password?
          </Link>
        </form>
      </Form>
    </div>
  );
}
