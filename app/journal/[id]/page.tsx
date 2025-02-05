import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JournalEntryActions } from "@/components/journal-entry-actions";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function JournalEntryPage({ params }: PageProps) {
  const { id } = params;

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const entry = await prisma.journalEntry.findUnique({
    where: {
      id,
    },
  });

  if (!entry || entry.userId !== user.id) {
    redirect("/journal");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 py-12 animate-in">
      <div className="container max-w-4xl px-4">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hover:bg-white/20 dark:hover:bg-gray-800/50 transition-colors"
          >
            <Link href="/journal">
              <Icons.back className="h-4 w-4 mr-2" />
              Back to Journal
            </Link>
          </Button>
          <JournalEntryActions entryId={entry.id} isPublic={entry.isPublic} />
        </div>
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-6">
            <div className="space-y-4">
              <CardTitle className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {entry.title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Icons.calendar className="h-4 w-4 mr-2" />
                  {formatDate(entry.createdAt.toISOString())}
                </div>
                {entry.mood && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center">
                      <Icons.mood className="h-4 w-4 mr-2" />
                      <span
                        role="img"
                        aria-label={entry.mood}
                        className="text-base"
                      >
                        {entry.mood}
                      </span>
                    </div>
                  </>
                )}
                {entry.isPublic && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center">
                      <Icons.globe className="h-4 w-4 mr-2" />
                      <Badge
                        variant="secondary"
                        className="font-normal bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                      >
                        Public
                      </Badge>
                    </div>
                  </>
                )}
              </div>
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex items-center gap-3">
                  <Icons.tags className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="px-3 py-1 bg-pink-50 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-100 dark:border-pink-700 hover:bg-pink-100 dark:hover:bg-pink-800 transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-700" />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-24rem)] pr-6">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {entry.content.split("\n").map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-base leading-relaxed text-gray-700 dark:text-gray-300"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 mt-5">
              <Icons.calendar className="h-4 w-4" />
              Last updated {formatDate(entry.updatedAt.toISOString())}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
