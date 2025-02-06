import { type NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextRequest,
  { params }: Pick<{ params: { id: string } }, "params">
) {
  const { id } = params;

  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (req.method === "GET") {
      const entry = await prisma.journalEntry.findUnique({
        where: { id },
      });

      if (!entry) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
      }

      if (entry.userId !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json(entry);
    } else if (req.method === "PATCH") {
      const entry = await prisma.journalEntry.findUnique({
        where: { id },
      });

      if (!entry) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
      }

      if (entry.userId !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await req.json();
      const { title, content, mood, tags } = body;

      const updatedEntry = await prisma.journalEntry.update({
        where: { id },
        data: {
          title: title || entry.title,
          content: content || entry.content,
          mood: mood || entry.mood,
          tags: tags || entry.tags,
        },
      });

      return NextResponse.json(updatedEntry);
    } else if (req.method === "DELETE") {
      const entry = await prisma.journalEntry.findUnique({
        where: { id },
      });

      if (!entry) {
        return NextResponse.json({ error: "Entry not found" }, { status: 404 });
      }

      if (entry.userId !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await prisma.journalEntry.delete({
        where: { id },
      });

      return NextResponse.json({ message: "Entry deleted successfully" });
    } else {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }
  } catch (error) {
    console.error("[JOURNAL_HANDLER_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
