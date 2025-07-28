// File: app/dashboard/release-notes/templates/page.tsx
import { redirect } from "next/navigation";

export default function TemplatesRedirectPage() {
  // Change the URL below to whatever new page you want to redirect the user to.
  redirect("/dashboard/release-notes/templates/page");
}

// import { redirect } from "next/navigation";

// export default function ReleaseNotesRoot() {
//   redirect("/dashboard/release-notes/templates");
// }
