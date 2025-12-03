import { SignInForm } from "./signin-form";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams?.error;

  return <SignInForm error={error} />;
}
