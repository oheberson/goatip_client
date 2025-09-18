import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatPlayerName = (name) => {
  if (!name) return "";

  const nameParts = name.trim().split(" ");

  // If single name, return as is
  if (nameParts.length === 1) {
    return nameParts[0];
  }

  // If multiple names, use first letter of first name + last name
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];

  return `${firstName[0].toUpperCase()}. ${lastName}`;
};
