"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type ClientChatDrawerContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const ClientChatDrawerContext = createContext<ClientChatDrawerContextValue | null>(null);

export function ClientChatDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <ClientChatDrawerContext.Provider value={{ isOpen, open, close }}>
      {children}
    </ClientChatDrawerContext.Provider>
  );
}

export function useClientChatDrawer() {
  const ctx = useContext(ClientChatDrawerContext);
  if (!ctx) throw new Error("useClientChatDrawer must be used within ClientChatDrawerProvider");
  return ctx;
}
