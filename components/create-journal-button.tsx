"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/icons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function CreateJournalButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: formData.get("title"),
      content: formData.get("content"),
      mood: formData.get("mood"),
      tags: formData
        .get("tags")
        ?.toString()
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create entry");
      }

      const entry = await response.json();
      setOpen(false);
      router.refresh();
      router.push(`/journal/${entry.id}`);
    } catch (error: any) {
      console.error("Failed to create journal entry:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="gap-2 pl-3 pr-4 hover:scale-105 transition-transform bg-gradient-to-r from-purple-500 to-pink-500 text-white"
        >
          <Icons.edit className="h-5 w-5" />
          New Entry
        </Button>
      </DialogTrigger>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-[625px] bg-black">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  <Icons.edit className="h-6 w-6" />
                  Create New Journal Entry
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
                  Write down your thoughts, feelings, and experiences.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter the title of your entry"
                    className="h-11 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="content"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Content
                  </Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Write your journal entry here..."
                    className="min-h-[200px] resize-none bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="mood"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Mood (optional)
                    </Label>
                    <Input
                      id="mood"
                      name="mood"
                      placeholder="How are you feeling? (e.g. 😊, 😔, 😌)"
                      className="h-11 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="tags"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Tags (optional)
                    </Label>
                    <Input
                      id="tags"
                      name="tags"
                      placeholder="Enter tags separated by commas"
                      className="h-11 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className={cn(
                      loading && "pointer-events-none opacity-50",
                      "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="min-w-[100px] bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  >
                    {loading ? (
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                    ) : (
                      "Create"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
