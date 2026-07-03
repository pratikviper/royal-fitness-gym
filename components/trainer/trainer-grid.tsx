import { trainers } from "@/data/trainers";
import { TrainerCard } from "@/components/trainer/trainer-card";
import { StaggerGroup, StaggerItem } from "@/components/shared/reveal";

/** Grid of all trainer cards. */
export function TrainerGrid() {
  return (
    <StaggerGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {trainers.map((trainer) => (
        <StaggerItem key={trainer.id}>
          <TrainerCard trainer={trainer} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
