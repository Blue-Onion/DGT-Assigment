import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  budgetRange: z.enum(["under-1k", "1k-5k", "5k-10k", "10k-plus"], {
    error: "Please select a budget range",
  }),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const BUDGET_OPTIONS = [
  { value: "under-1k", label: "Under $1,000" },
  { value: "1k-5k", label: "$1,000 - $5,000" },
  { value: "5k-10k", label: "$5,000 - $10,000" },
  { value: "10k-plus", label: "$10,000+" },
] as const;

export const STATUS_OPTIONS = ["New", "Contacted", "Closed"] as const;
