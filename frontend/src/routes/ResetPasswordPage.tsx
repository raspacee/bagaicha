import { useResetPassword } from "@/api/AuthApi";
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
import { ResetPasswordForm, resetPasswordFormSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

const ResetPasswordPage = () => {
  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordFormSchema),
  });
  const { resetToken } = useParams();

  const { resetPassword, isPending } = useResetPassword(resetToken as string);

  const onSubmit = (formDataJson: ResetPasswordForm) => {
    resetPassword(formDataJson);
  };

  return (
    <div className="container h-screen flex flex-col items-center py-2 px-2 mt-4">
      <h1 className="text-4xl font-extrabold">Reset Password Page</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full md:w-[33%] mt-5 border shadow px-4 py-2 rounded-md flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    placeholder="new password here"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    placeholder="confirm password here"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormMessage>
            {form.formState.errors.confirmPassword?.message}
          </FormMessage>
          <Button type="submit" disabled={isPending}>
            Reset Password
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ResetPasswordPage;
