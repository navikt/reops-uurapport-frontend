import { apiProxyUrl } from "@src/utils/client/urls";

export const updateDeadline = async (deadline: string | null) => {
  const response = await fetch(`${apiProxyUrl}/admin/deadline`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deadline }),
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to update deadline");
  }
};
