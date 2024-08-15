import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Button } from "../ui/button";

const formSchema = z.object({
  searchQuery: z.string().min(1).max(50),
});

export type SearchForm = z.infer<typeof formSchema>;

const SearchBar = () => {
  const form = useForm<SearchForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchQuery: "",
    },
  });
  const navigate = useNavigate();

  const onSubmit = (values: SearchForm) => {
    navigate({
      pathname: `/search`,
      search: `?q=${values.searchQuery}`,
    });
  };

  const handleReset = () => {
    form.reset({
      searchQuery: "",
    });
    form.clearErrors("searchQuery");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        // onKeyDown={}
        className={`flex flex-row h-[3rem] gap-2 items-center justify-between p-3 border-2 rounded-full
            ${form.formState.errors.searchQuery && "border-red-500 border"}`}
      >
        <Search strokeWidth={2.5} className="hidden md:block ml-1" />
        <FormField
          control={form.control}
          name="searchQuery"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  className="border-none shadow-none text-md focus-visible:ring-0"
                  placeholder="Search restaurant"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button onClick={() => handleReset()} variant="ghost" type="reset">
          <X />
        </Button>
        <Button
          type="submit"
          variant="ghost"
          className="rounded-full hidden md:block"
        >
          Search
        </Button>
      </form>
    </Form>
  );
};

export default SearchBar;
