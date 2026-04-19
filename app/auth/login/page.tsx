import { isMockAuthDisabled } from "@/lib/nightos/env";
import LoginForm from "./login-form";

export default function LoginPage() {
  const mockAuthEnabled = !isMockAuthDisabled();
  return <LoginForm mockAuthEnabled={mockAuthEnabled} />;
}
