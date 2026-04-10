"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { AddBottleItem } from "./add-bottle-item";
import type { AddBottleCandidateMock } from "../data/mock";

type AddBottleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  candidates?: AddBottleCandidateMock[];
};

export function AddBottleModal({ isOpen, onClose, candidates = [] }: AddBottleModalProps) {
  const handleSelect = (id: string) => {
    alert(`ボトルを追加しました（MVP: 表示のみ）\nID: ${id}`);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="ボトル追加"
      subtitle="キープするお酒を選択"
    >
      <div className="space-y-3">
        {candidates.map((candidate) => (
          <AddBottleItem
            key={candidate.id}
            candidate={candidate}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </BottomSheet>
  );
}
