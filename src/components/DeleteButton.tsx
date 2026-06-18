"use client";

import { useTransition } from "react";
import { deleteCompany } from "@/app/actions";

export function DeleteButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm(`Delete ${name}? This cannot be undone.`)) {
          startTransition(() => deleteCompany(id));
        }
      }}
      disabled={isPending}
      className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-60"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
