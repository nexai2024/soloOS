// lib/actions/ideas.ts
"use server"

import { prisma } from "@/lib/prisma";
import { scoreIdea } from "@/lib/idea-scorer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { e164 } from "zod";

export async function createIdea(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  const idea = await prisma.idea.create({
    data: { title, description }
  });

  revalidatePath("/ideas");
  redirect(`/ideas/${idea.id}`);
}

export async function triggerScoring(id: string) {
  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) return;

  const scores = await scoreIdea(idea.title, idea.description);
  if (scores) {
    await prisma.idea.update({
      where: { id },
      data: scores
    });
  }
  revalidatePath(`/ideas/${id}`);
}

export async function promoteToProject(id: string) {
  // Logic to move to a 'Projects' table (omitted for brevity)
  await prisma.idea.update({
    where: { id },
    data: { status: "PROMOTED" }
  });
  revalidatePath(`/ideas/${id}`);
}

export async function archiveIdea(id: string) {
  await prisma.idea.update({
    where: { id },
    data: { status: "ARCHIVED" }
  });
  revalidatePath(`/ideas/${id}`);
} 

export async function deleteIdea(id: string) {
  await prisma.idea.delete({
    where: { id }
  });
  revalidatePath(`/ideas/${id}`);
} 

export async function getIdeaaForUser(userId: string) {
   return await prisma.idea.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}


export async function getIdeaById(id: string) {
  return await prisma.idea.findUnique({
    where: { id }
  });
  revalidatePath(`/ideas`);
} 

export async function validateIdea(id: string) {
  await prisma.idea.update({
    where: { id },
    data: { status: "VALIDATING" }
  });
  revalidatePath(`/ideas/${id}`);
} 