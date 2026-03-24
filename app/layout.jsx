export const metadata = {
  title: "AgentBuilder — Seu Agente de IA",
  description: "Agente de IA configurável para qualquer negócio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
