import LoginForm from "./login-form";

export const metadata = {
  title: "Login — Houseiana Leads",
};

export default function LoginPage() {
  return (
    <div className="login-shell">
      <LoginForm />
    </div>
  );
}
