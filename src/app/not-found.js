import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { StatusScreen } from "@/components/workspace/StatusScreen";
import { getProjectIds } from "@/lib/project";

export default function NotFound() {
  return (
    <StatusScreen
      title="This project doesn't exist"
      action={
        <Link href={`/projects/${getProjectIds()[0]}`} className={buttonClasses({ variant: "ink" })}>
          Open the HALO shoot
        </Link>
      }
    >
      It may have been renamed or you may not have access to it.
    </StatusScreen>
  );
}
