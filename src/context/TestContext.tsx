"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface TestContextType {
  isTestActive: boolean;
  setTestActive: (active: boolean) => void;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export function TestProvider({ children }: { children: ReactNode }) {
  const [isTestActive, setTestActive] = useState(false);
  return (
    <TestContext.Provider value={{ isTestActive, setTestActive }}>
      {children}
    </TestContext.Provider>
  );
}

export function useTestContext() {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error("useTestContext must be used within TestProvider");
  }
  return context;
}
