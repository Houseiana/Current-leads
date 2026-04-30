import LoginForm from "../login-form";

export const metadata = {
  title: "Admin Sign In",
};

export default function AdminLoginPage() {
  return (
    <div className="login-shell">
      <LoginForm role="admin" />
    </div>
  );
}
