"use client";

import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/shared/api/orpc";

export interface DashboardScreenProps {
  userName: string;
}

export function DashboardScreen({ userName }: DashboardScreenProps) {
  const privateData = useQuery(orpc.privateData.queryOptions());

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {userName}</p>
      <p>API: {privateData.data?.message}</p>
    </div>
  );
}
