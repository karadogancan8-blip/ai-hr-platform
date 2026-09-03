"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ACCESS_UPDATED_EVENT,
  ROLE_UPDATED_EVENT,
  canManageAccess,
  canViewModule,
  defaultAccessControl,
  fetchAccessBundle,
  type AccessControlMap,
  type AppRole,
  type EnterpriseModuleId,
} from "@/lib/access-control";
import { isSupabaseConfigured } from "@/lib/supabase";

type AccessContextValue = {
  loading: boolean;
  role: AppRole;
  access: AccessControlMap;
  canManage: boolean;
  canView: (moduleId: EnterpriseModuleId) => boolean;
};

const AccessContext = createContext<AccessContextValue>({
  loading: true,
  role: "employee",
  access: defaultAccessControl(),
  canManage: false,
  canView: () => false,
});

export function useAccessControl() {
  return useContext(AccessContext);
}

export function AccessControlProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole>("employee");
  const [access, setAccess] = useState<AccessControlMap>(defaultAccessControl);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setRole("employee");
      setAccess(defaultAccessControl());
      setLoading(false);
      return;
    }
    try {
      const bundle = await fetchAccessBundle();
      setRole(bundle.role);
      setAccess(bundle.access);
    } catch {
      setRole("employee");
      setAccess(defaultAccessControl());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    function onAccess(event: Event) {
      const detail = (event as CustomEvent<AccessControlMap>).detail;
      if (detail) setAccess(detail);
    }
    function onRole(event: Event) {
      const detail = (event as CustomEvent<AppRole>).detail;
      if (detail) setRole(detail);
    }
    window.addEventListener(ACCESS_UPDATED_EVENT, onAccess);
    window.addEventListener(ROLE_UPDATED_EVENT, onRole);
    return () => {
      window.removeEventListener(ACCESS_UPDATED_EVENT, onAccess);
      window.removeEventListener(ROLE_UPDATED_EVENT, onRole);
    };
  }, [load]);

  const value = useMemo<AccessContextValue>(
    () => ({
      loading,
      role,
      access,
      canManage: canManageAccess(role),
      canView: (moduleId) => canViewModule(role, access[moduleId], moduleId),
    }),
    [access, loading, role],
  );

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}
