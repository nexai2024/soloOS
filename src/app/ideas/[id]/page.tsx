import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { IdeaDetailClient } from "@/components/ideas/IdeaDetailClient";

export default async function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      personas: true,
      problemStatements: true,
      validationItems: true,
      competitors: true,
      scoreImprovements: true
    }
  });

  if (!idea) notFound();

  return <IdeaDetailClient idea={idea} />;
}