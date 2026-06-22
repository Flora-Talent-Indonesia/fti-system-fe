"use client";

import { useEffect, useState } from "react";
import { isFtiAdmin } from "@/lib/portal-session";

export function useFtiAdmin() {
  const [ftiAdmin, setFtiAdmin] = useState(false);

  useEffect(() => {
    setFtiAdmin(isFtiAdmin());
  }, []);

  return ftiAdmin;
}
