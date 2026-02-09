"use client";

import { useState } from "react";
import { Button } from "@/shared/shadcn/button";
import { Input } from "@/shared/shadcn/input";
import { Label } from "@/shared/shadcn/label";
import { useSignUp } from "../api/use-sign-up";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate, isPending, error, reset } = useSignUp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ name, email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          autoComplete="name"
          disabled={isPending}
          value={name}
          onChange={(e) => { reset(); setName(e.target.value); }}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          disabled={isPending}
          value={email}
          onChange={(e) => { reset(); setEmail(e.target.value); }}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          disabled={isPending}
          value={password}
          onChange={(e) => { reset(); setPassword(e.target.value); }}
          required
        />
      </div>
      {error && <p className="text-destructive text-sm">{error.message}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Signing up..." : "Sign up"}
      </Button>
    </form>
  );
}
