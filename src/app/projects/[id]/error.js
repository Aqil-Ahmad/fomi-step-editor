"use client";

import { Button } from "@/components/ui/Button";
import { StatusScreen } from "@/components/workspace/StatusScreen";

export default function ProjectError({ retry }) {
  return (
    <StatusScreen
      title="The project didn't load"
      action={
        <Button variant="ink" onClick={() => retry()}>
          Try again
        </Button>
      }
    >
      Nothing you changed is lost. Try again, and if it keeps happening, reload the page.
    </StatusScreen>
  );
}
