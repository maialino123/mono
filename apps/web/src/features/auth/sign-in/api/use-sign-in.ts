import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/shared/api";

export function useSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await authClient.signIn.email({ email, password });
      if (res.error) {
        throw new Error(res.error.message ?? "Invalid email or password");
      }
      return res.data;
    },
  });
}
