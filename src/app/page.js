import { redirect } from "next/navigation";
import { getProjectIds } from "@/lib/project";

export default function Home() {
  redirect(`/projects/${getProjectIds()[0]}`);
}
