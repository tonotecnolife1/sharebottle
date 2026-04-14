"use client";

import { useEffect, useState } from "react";
import { getStorePermission } from "@/lib/nightos/store-permission-store";

/**
 * 子要素を「オーナー権限のみ」表示する。スタッフの場合は非表示。
 */
export function OwnerOnly({ children }: { children: React.ReactNode }) {
  const [isOwner, setIsOwner] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIsOwner(getStorePermission() === "owner");
    setLoaded(true);
  }, []);

  if (!loaded) return null;
  if (!isOwner) return null;
  return <>{children}</>;
}

/**
 * オーナー・スタッフで異なるUIを出し分けるためのフック的コンポーネント。
 */
export function StorePermissionSwitch({
  owner,
  staff,
}: {
  owner: React.ReactNode;
  staff: React.ReactNode;
}) {
  const [isOwner, setIsOwner] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIsOwner(getStorePermission() === "owner");
    setLoaded(true);
  }, []);

  if (!loaded) return null;
  return <>{isOwner ? owner : staff}</>;
}
