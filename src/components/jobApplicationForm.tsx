import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircledIcon, PlusIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";

interface KeyDetail {
  [index: number]: string;
}
interface Application {
  _id: string;
  jobId: string;
  position: string;
  company: string;
  status: string;
  nextStep: string;
  applicationDate: string;
  keyDetails: KeyDetail;
  userId: string;
  from: string;
  fromName: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}
interface Card extends Application {
  title: string;
  column: string;
}
interface JobApplicationFormProps {
  initialStatus?: string | number | undefined;
  setCards: React.Dispatch<React.SetStateAction<Card[]>> | null;
}

const formSchema = z.object({
  position: z.string().min(1, "Position is required"),
  company: z.string().min(1, "Company is required"),
  status: z
    .union([z.string().min(1, "Status is required"), z.number(), z.undefined()])
    .optional(),
  nextStep: z.string().optional(),
  keyDetails: z.array(z.string()).optional(),
});

export function JobApplicationForm({
  initialStatus,
  setCards,
}: 
JobApplicationFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: "",
      company: "",
      status: initialStatus,
      nextStep: "",
      keyDetails: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const newCard: any = {
        id: Math.random().toString(),
        column: values.status, // Setting column as status
        position: values.position,
        company: values.company,
        keyDetails: values.keyDetails,
        nextStep: values.nextStep,
        date: "new date",
      };

      // setCards
      //   ? setCards((prevCards) => [...prevCards, newCard])
      //   : console.log("no setcards");

      console.log("values", values);
      await axios.post("/api/fetch-applications", values);
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {initialStatus ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <PlusCircledIcon className="h-4 w-4" />
            <span className="sr-only">Add new task</span>
          </Button>
        ) : (
          <Button
            onClick={() => setIsOpen(true)}
            className="h-full whitespace-nowrap"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            New Application
          </Button>
          // <Button onClick={() => setIsOpen(true)}>Add Job Application</Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Form {...form}>
          {/* <motion.form
            layout
            
            className="space-y-4"
          > */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Software Engineer Frontend Consumer Products"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Coinbase" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="interviewing">Interviewing</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nextStep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Step</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keyDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Details</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter key details, one per line"
                      onChange={(e) =>
                        field.onChange(e.target.value.split("\n"))
                      }
                      value={field.value?.join("\n")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
          {/* </motion.form> */}
        </Form>
      </PopoverContent>
    </Popover>
  );
}
