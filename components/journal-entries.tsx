"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { motion } from "framer-motion";
// import { useToast } from "@/hooks/use-toast"

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  mood?: string;
  location?: string;
  weather?: string;
  category?: string;
  tags: string[];
  isEncrypted: boolean;
  wordCount: number;
  readTime: number;
  sentiment?: number;
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

export function JournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  // const { toast } = useToast()

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch("/api/journal");
      if (!response.ok) {
        throw new Error("Failed to fetch entries");
      }
      const data = await response.json();
      setEntries(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching journal entries:", err);
      setError("Failed to load journal entries. Please try again later.");
      // toast({
      //   title: "Error",
      //   description: "Failed to load journal entries. Please try again later.",
      //   variant: "destructive",
      // })
      setLoading(false);
    }
  };

  const filteredAndSortedEntries = entries
    .filter(
      (entry) =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((entry) => !categoryFilter || entry.category === categoryFilter)
    .filter((entry) => !tagFilter || entry.tags.includes(tagFilter))
    .sort((a, b) => {
      if (sortBy === "createdAt") {
        return sortOrder === "desc"
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      // Add more sorting options here
      return 0;
    });

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[320px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <CardTitle className="text-2xl mb-2">
          Oops! Something went wrong
        </CardTitle>
        <CardDescription>{error}</CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Search entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-auto"
        />
        <Select
          value={categoryFilter}
          onValueChange={setCategoryFilter}
          // className="w-full sm:w-auto"
        >
          <option value="">All Categories</option>
          {/* Add category options here */}
        </Select>
        <Select
          value={tagFilter}
          onValueChange={setTagFilter}
          // className="w-full sm:w-auto"
        >
          <option value="">All Tags</option>
          {/* Add tag options here */}
        </Select>
        <Select
          value={sortBy}
          onValueChange={setSortBy}
          // className="w-full sm:w-auto"
        >
          <option value="createdAt">Date Created</option>
          <option value="updatedAt">Date Updated</option>
          <option value="title">Title</option>
          <option value="sentiment">Sentiment</option>
        </Select>
        <Select
          value={sortOrder}
          onValueChange={setSortOrder}
          // className="w-full sm:w-auto"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </Select>
      </div>
      {filteredAndSortedEntries.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <CardTitle className="text-2xl mb-2">
            No journal entries found
          </CardTitle>
          <CardDescription>
            Try adjusting your search or filters, or create a new entry.
          </CardDescription>
          <Button className="mt-4" asChild>
            <Link href="/journal/new">Create New Entry</Link>
          </Button>
        </Card>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredAndSortedEntries.map((entry) => (
            <motion.div key={entry.id} variants={item}>
              <Link href={`/journal/${entry.id}`}>
                <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Icons.calendar className="h-4 w-4" />
                        <span>{formatDate(entry.createdAt)}</span>
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
                    </div>
                    <CardTitle className="line-clamp-2 leading-tight">
                      {entry.title}
                    </CardTitle>
                    {entry.isEncrypted && (
                      <Badge variant="secondary" className="mt-2">
                        <Icons.lock className="h-3 w-3 mr-1" />
                        Encrypted
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                      {entry.content}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="text-sm text-gray-500">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <Icons.book className="h-4 w-4" />
                        <span>{entry.wordCount} words</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icons.clock className="h-4 w-4" />
                        <span>{formatReadTime(entry.readTime)}</span>
                      </div>
                      {entry.sentiment !== undefined && (
                        <div className="flex items-center space-x-2">
                          <Icons.trendingUp className="h-4 w-4" />
                          <span>{entry.sentiment.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
