import AuthForm from "@/components/ui/AuthForm";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
