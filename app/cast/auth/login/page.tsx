import LoginForm from "@/features/auth/login-form";

export const metadata = { title: "ログイン | NIGHTOS Cast" };

export default function CastLoginPage() {
  return <LoginForm app="cast" />;
}
