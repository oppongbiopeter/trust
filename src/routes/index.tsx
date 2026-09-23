import { createFileRoute } from "@tanstack/react-router";
import { TrustApp } from "@/components/trust/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <TrustApp />;
}
