import { Box, Container } from "@mui/material";
import { useState, type ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box sx={{ bgcolor: "background.default", display: "flex", minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Header onToggleSidebar={() => setCollapsed((prev) => !prev)} />
        <Container maxWidth="xl" sx={{ py: 3.5 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
