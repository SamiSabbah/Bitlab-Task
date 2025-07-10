import { notFound } from "next/navigation";

export default function NotFound() {
  // Automatically redirects the user to the homepage
  notFound();

  return null; // No content needed, since the redirect happens
}
