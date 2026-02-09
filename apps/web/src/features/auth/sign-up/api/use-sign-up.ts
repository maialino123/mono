import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/shared/api";

export function useSignUp() {
  return useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const res = await authClient.signUp.email({ email, password, name });
      if (res.error) {
        throw new Error(res.error.message ?? "Sign up failed");
      }
      return res.data;
    },
  });
}
