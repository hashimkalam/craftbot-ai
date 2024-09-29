import { SignIn } from "@clerk/nextjs";

function LoginPage() {
  return (
    <div className="flex py-10 md:py-0 flex-col flex-1 justify-center items-center bg-primary">
      <SignIn routing="hash" fallbackRedirectUrl="/" />
    </div>
  );
}

export default LoginPage;
