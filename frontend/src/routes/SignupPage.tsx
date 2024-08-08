import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SignupForm, signupFormSchema } from "@/lib/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSignupUser } from "@/api/AuthApi";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Signup() {
  const form = useForm<SignupForm>({
    resolver: zodResolver(signupFormSchema),
  });
  const { signupUser, isPending } = useSignupUser();

  const onSubmit = async (data: SignupForm) => {
    signupUser(data);
  };

  return (
    <div className="w-screen h-screen bg-gray-200 flex items-center justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white rounded-md shadow px-8 py-6 flex flex-col gap-3 h-full md:h-auto w-full md:w-auto"
        >
          <h1 className="text-4xl tracking-tight font-extrabold mb-6">
            Signup Page
          </h1>
          <ScrollArea className="h-full w-full">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="text-lg w-[95%] ml-1"
                      placeholder="Enter First Name"
                    />
                  </FormControl>
                  <FormMessage className="text-xs">
                    {form.formState.errors?.firstName?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="text-lg w-[95%] ml-1"
                      placeholder="Enter Last Name"
                    />
                  </FormControl>
                  <FormMessage className="text-xs">
                    {form.formState.errors?.lastName?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="text-lg w-[95%] ml-1"
                      placeholder="Enter Email"
                    />
                  </FormControl>
                  <FormMessage className="text-xs">
                    {form.formState.errors?.email?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="text-lg w-[95%] ml-1"
                      placeholder="Enter Password"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage className="text-xs">
                    {form.formState.errors?.password?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
          </ScrollArea>
          <Button disabled={isPending} type="submit" className="mt-4 flex-1">
            Signup
          </Button>
          <Link to="/login">Already have an account?</Link>
        </form>
      </Form>
    </div>
  );
}
