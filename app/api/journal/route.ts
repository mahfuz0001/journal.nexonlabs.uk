import { type NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (req.method === "GET") {
      const entries = await prisma.journalEntry.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(entries);
    } else if (req.method === "POST") {
      const body = await req.json();
      const { title, content, mood, tags } = body;

      if (!title || !content) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      const entry = await prisma.journalEntry.create({
        data: {
          title,
          content,
          mood: mood || null,
          tags: tags || [],
          userId: user.id,
        },
      });

      return NextResponse.json(entry);
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
