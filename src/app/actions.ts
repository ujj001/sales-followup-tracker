"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addDays } from "@/lib/dates";

function str(v: FormDataEntryValue | null): string {
  return (v ?? "").toString().trim();
}

function parseDate(v: FormDataEntryValue | null): Date | null {
  const s = str(v);
  if (!s) return null;
  // <input type="date"> gives YYYY-MM-DD — anchor at local midnight.
  const d = new Date(`${s}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

export async function createCompany(formData: FormData) {
  const name = str(formData.get("name"));
  const contactName = str(formData.get("contactName"));
  if (!name || !contactName) {
    throw new Error("Company name and contact name are required.");
  }
  const nextFollowUp = parseDate(formData.get("nextFollowUp")) ?? addDays(1);

  await prisma.company.create({
    data: {
      name,
      contactName,
      salesRep: str(formData.get("salesRep")) || null,
      salesRepEmail: str(formData.get("salesRepEmail")) || null,
      phone: str(formData.get("phone")) || null,
      email: str(formData.get("email")) || null,
      notes: str(formData.get("notes")) || null,
      lastContacted: parseDate(formData.get("lastContacted")),
      nextFollowUp,
    },
  });

  revalidatePath("/");
  revalidatePath("/companies");
  redirect("/companies");
}

export async function updateCompany(id: string, formData: FormData) {
  const name = str(formData.get("name"));
  const contactName = str(formData.get("contactName"));
  if (!name || !contactName) {
    throw new Error("Company name and contact name are required.");
  }
  const nextFollowUp = parseDate(formData.get("nextFollowUp"));

  await prisma.company.update({
    where: { id },
    data: {
      name,
      contactName,
      salesRep: str(formData.get("salesRep")) || null,
      salesRepEmail: str(formData.get("salesRepEmail")) || null,
      phone: str(formData.get("phone")) || null,
      email: str(formData.get("email")) || null,
      notes: str(formData.get("notes")) || null,
      lastContacted: parseDate(formData.get("lastContacted")),
      ...(nextFollowUp ? { nextFollowUp } : {}),
    },
  });

  revalidatePath("/");
  revalidatePath("/companies");
  redirect("/companies");
}

export async function deleteCompany(id: string) {
  await prisma.company.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/companies");
}

// Called from the "Complete Call" modal.
export async function completeCall(formData: FormData) {
  const id = str(formData.get("companyId"));
  const outcome = str(formData.get("outcome"));
  const note = str(formData.get("note"));
  const followUpInRaw = str(formData.get("followUpIn")); // "1","2","3","7","14","custom"

  if (!id || !outcome) {
    throw new Error("Outcome is required.");
  }

  let nextFollowUp: Date;
  if (followUpInRaw === "custom") {
    const custom = parseDate(formData.get("customDate"));
    if (!custom) throw new Error("Please pick a custom follow-up date.");
    nextFollowUp = custom;
  } else {
    const days = parseInt(followUpInRaw, 10);
    nextFollowUp = addDays(isNaN(days) ? 1 : days);
  }

  await prisma.$transaction([
    prisma.company.update({
      where: { id },
      data: {
        lastContacted: new Date(),
        nextFollowUp,
        // Keep the latest context visible on the list; full history lives in CallLog.
        ...(note ? { notes: note } : {}),
      },
    }),
    prisma.callLog.create({
      data: {
        companyId: id,
        outcome,
        note: note || null,
        nextFollowUp,
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/companies");
}
