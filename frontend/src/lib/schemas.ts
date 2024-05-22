import { z } from "zod";

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const ReviewSchema = z.object({
  comment: z
    .string()
    .min(5, {
      message: "Please describe the food in more words",
    })
    .max(500, {
      message: "Sorry the comment cannot be more than 500 characters",
    }),
  rating: z.string().refine(
    (value: string) => {
      const ratings = ["1", "2", "3", "4", "5"];
      return ratings.includes(value);
    },
    { message: "Please select valid rating stars" },
  ),
  picture: z.custom(
    (file) => {
      return ACCEPTED_IMAGE_TYPES.includes((file as File).type);
    },
    {
      message: "Image is required",
    },
  ),
  place: z.custom(
    (place) => {
      console.log(place);
      return place != "";
    },
    {
      message: "You can only choose places that show in the suggestion box.",
    },
  ),
});

export const FormSchema = z.object({
  email: z
    .string({
      invalid_type_error: "Please enter a email address",
    })
    .email({ message: "Please type a valid email address" }),
  password: z
    .string({
      invalid_type_error: "Please type your password",
    })
    .min(5, { message: "Password must atleast be of length 5" })
    .max(20),
  first_name: z
    .string()
    .min(2, { message: "First name should be atleast 2 character" })
    .max(20, { message: "First name cannot be longer than 20 characters" }),
  last_name: z
    .string()
    .min(2, { message: "Last name should be atleast 2 character" })
    .max(20),
});

export const LoginSchema = FormSchema.omit({
  first_name: true,
  last_name: true,
});

export const SignupSchema = FormSchema;

export type SignupSchemaType = z.infer<typeof SignupSchema>;
export type LoginSchemaType = z.infer<typeof LoginSchema>;
export type ReviewSchemaType = z.infer<typeof ReviewSchema>;
