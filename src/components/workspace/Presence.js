import { cn } from "@/lib/cn";
import { Tooltip } from "@/components/ui/Tooltip";

const tones = {
  sand: "bg-sand text-sand-ink",
  sage: "bg-sage text-sage-ink",
};

export function Presence({ people }) {
  return (
    <ul aria-label="People on this project" className="mr-1.5 flex pl-1.75">
      {people.map((person) => (
        <li key={person.id} className="-ml-1.75">
          <Tooltip label={`${person.name}, ${person.role}${person.online ? " · here now" : ""}`} side="bottom">
            <span
              className={cn(
                "grid size-7.5 place-items-center rounded-full border-2 border-panel text-caption font-bold",
                tones[person.tone],
              )}
            >
              <span aria-hidden="true">{person.initials}</span>
              <span className="sr-only">
                {person.name}, {person.role}
                {person.online ? ", here now" : ""}
              </span>
            </span>
          </Tooltip>
        </li>
      ))}
    </ul>
  );
}
