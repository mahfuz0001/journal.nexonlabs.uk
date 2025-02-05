"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  mood: z.string().optional(),
  tags: z.string().optional(),
});

interface EditJournalFormProps {
  entry: {
    id: string;
    title: string;
    content: string;
    mood?: string | null;
    tags: string[];
  };
}

export function EditJournalForm({ entry }: EditJournalFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: entry.title,
      content: entry.content,
      mood: entry.mood || "",
      tags: entry.tags.join(", "),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/journal/${entry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: values.title,
          content: values.content,
          mood: values.mood || null,
          tags: values.tags
            ? values.tags.split(",").map((tag) => tag.trim())
            : [],
        }),
      });

      if (!response.ok) throw new Error("Failed to update entry");

      router.push(`/journal/${entry.id}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to update journal entry:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Edit Journal Entry
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Link href={`/journal/${entry.id}`}>
                <Icons.back className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter title"
                        {...field}
                        className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Content
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your thoughts..."
                        className="min-h-[200px] bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Mood (optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="How are you feeling? (e.g. 😊, 😔, 😌)"
                        {...field}
                        className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">
                      Tags (optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter tags separated by commas"
                        {...field}
                        className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                >
                  {isLoading && (
                    <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
