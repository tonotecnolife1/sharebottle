import LoginForm from "@/features/auth/login-form";

export const metadata = { title: "ログイン | NIGHTOS Store" };

export default function StoreLoginPage() {
  return <LoginForm app="store" />;
}
