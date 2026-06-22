"use client";

import { Toaster } from "react-hot-toast";

export function GlobalToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "#ffffff",
          color: "#0a0a0a",
          border: "1px solid #e5e5e5",
          borderRadius: 0,
        },
        success: {
          iconTheme: {
            primary: "#fc809f",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#fc809f",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
