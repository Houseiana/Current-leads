import LoginChooser from "./login-chooser";

export const metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <div className="login-shell">
      <LoginChooser />
    </div>
  );
}
