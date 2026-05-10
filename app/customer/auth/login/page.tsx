import LoginForm from "@/features/auth/login-form";

export const metadata = { title: "ログイン | NIGHTOS Customer" };

export default function CustomerLoginPage() {
  return <LoginForm app="customer" />;
}
