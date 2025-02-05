import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { EditJournalForm } from "@/components/edit-journal-form";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditJournalPage({ params }: PageProps) {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Edit Journal Entry
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <EditJournalForm entry={entry} />
        </div>
      </div>
    </div>
  );
}
