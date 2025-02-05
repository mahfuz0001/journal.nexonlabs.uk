"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, formatReadTime } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { motion } from "framer-motion";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  mood?: string;
  tags: string[];
  isPublic: boolean;
  location?: string;
  weather?: string;
  sentiment?: number;
  themes: string[];
  wordCount: number;
  readTime: number;
  isFavorite: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

async function getJournalEntries(userId: string) {
  const res = await fetch(`/api/journal?userId=${userId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch entries");
  }
  return res.json();
}

export function JournalEntries({ userId }: { userId: string }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJournalEntries(userId)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[320px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900">
        <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-4 mb-4">
          <Icons.edit className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl mb-2 text-gray-900 dark:text-gray-100">
          No journal entries yet
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Start writing your thoughts and experiences by creating a new entry.
        </CardDescription>
      </Card>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {entries.map((entry) => (
        <motion.div key={entry.id} variants={item}>
          <Link href={`/journal/${entry.id}`}>
            <Card className="h-[320px] overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 bg-white dark:bg-black">
              <CardHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Icons.calendar className="h-4 w-4" />
                        <span>
                          {formatDate(entry.createdAt, "MMM d, yyyy")}
                        </span>
                      </div>
                      {entry.mood && (
                        <span
                          className="text-lg"
                          role="img"
                          aria-label={entry.mood}
                        >
                          {entry.mood}
                        </span>
                      )}
                      {entry.isFavorite && (
                        <Icons.star className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 leading-tight text-gray-900 dark:text-gray-100">
                      {entry.title}
                    </CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.isPublic && (
                      <Badge
                        variant="secondary"
                        className="font-normal bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                      >
                        <Icons.globe className="h-3 w-3 mr-1" />
                        Public
                      </Badge>
                    )}
                    {entry.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="bg-pink-50 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-100 dark:border-pink-700"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                  {entry.content}
                </p>
              </CardContent>
              <CardFooter className="text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <Icons.book className="h-4 w-4" />
                    <span>{entry.wordCount} words</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icons.clock className="h-4 w-4" />
                    <span>{formatReadTime(entry.readTime)}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
