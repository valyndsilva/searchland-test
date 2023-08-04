// Required to use Shadcn-ui
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Define a utility function named "cn" (short for "class name") for combining CSS class names.
export function cn(...inputs: ClassValue[]) {
  // Call the clsx function to merge the provided class names into a single string.
  const mergedClassNames = clsx(inputs);
  // Call the twMerge function to apply Tailwind CSS utility classes and merge with existing class names.
  return twMerge(mergedClassNames);
}
