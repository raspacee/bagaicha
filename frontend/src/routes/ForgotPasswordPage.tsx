import { useForgotPassword } from "@/api/AuthApi";
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
import { ForgotPasswordForm, forgotPasswordFormSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const ForgotPasswordPage = () => {
  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordFormSchema),
  });
  const { forgotPassword, isPending, isSuccess } = useForgotPassword();

  const onSubmit = (formDataJson: ForgotPasswordForm) => {
    forgotPassword(formDataJson.email);
  };

  return (
    <div className="container h-screen flex flex-col items-center py-2 px-2 mt-4">
      <h1 className="text-4xl font-extrabold">Forgot Password Page</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="border shadow px-5 py-2 rounded-md mt-10 flex flex-col gap-5 w-full md:w-[33%]"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter your email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} placeholder="email here" />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending}>
            Reset Password
          </Button>
          {isSuccess && (
            <FormMessage className="text-green-600">
              Please check your email account for the link to reset your
              password
            </FormMessage>
          )}
        </form>
      </Form>
    </div>
  );
};

export default ForgotPasswordPage;
