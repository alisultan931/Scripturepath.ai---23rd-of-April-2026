import { Suspense } from "react";
import Signin from "@/components/ui/sign-in-flo";

export default function SigninPage() {
  return (
    <Suspense>
      <Signin />
    </Suspense>
  );
}
