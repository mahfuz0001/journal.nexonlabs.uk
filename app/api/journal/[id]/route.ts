import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  try {
    const user = await currentUser();
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method === "GET") {
      const entry = await prisma.journalEntry.findUnique({
        where: { id: id as string },
      });

      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }

      if (entry.userId !== user.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      return res.status(200).json(entry);
    } else if (req.method === "PATCH") {
      const entry = await prisma.journalEntry.findUnique({
        where: { id: id as string },
      });

      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }

      if (entry.userId !== user.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const body = await req.body;
      const { title, content, mood, tags } = body;

      const updatedEntry = await prisma.journalEntry.update({
        where: { id: id as string },
        data: {
          title: title || entry.title,
          content: content || entry.content,
          mood: mood || entry.mood,
          tags: tags || entry.tags,
        },
      });

      return res.status(200).json(updatedEntry);
    } else if (req.method === "DELETE") {
      const entry = await prisma.journalEntry.findUnique({
        where: { id: id as string },
      });

      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }

      if (entry.userId !== user.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await prisma.journalEntry.delete({
        where: { id: id as string },
      });

      return res.status(200).json({ message: "Entry deleted successfully" });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("[JOURNAL_HANDLER_ERROR]", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export { handler as GET, handler as PATCH, handler as DELETE };
