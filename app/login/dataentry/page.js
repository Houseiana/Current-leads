import LoginForm from "../login-form";

export const metadata = {
  title: "Data Entry Sign In",
};

export default function DataEntryLoginPage() {
  return (
    <div className="login-shell">
      <LoginForm role="dataentry" />
    </div>
  );
}
