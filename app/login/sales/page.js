import LoginForm from "../login-form";

export const metadata = {
  title: "Sales Sign In",
};

export default function SalesLoginPage() {
  return (
    <div className="login-shell">
      <LoginForm role="sales" />
    </div>
  );
}
