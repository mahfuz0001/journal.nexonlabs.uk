import { redirect } from "next/navigation";
import { JournalEntries } from "@/components/journal-entries";
import { CreateJournalButton } from "@/components/create-journal-button";
import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

export default async function JournalPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          My Journal
        </h1>
        <div className="flex items-center gap-4">
          <CreateJournalButton key={user.id} />
          <UserButton />
        </div>
      </div>

      <JournalEntries userId={user.id} />
    </div>
  );
}
