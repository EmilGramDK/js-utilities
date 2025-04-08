export async function ping(url: string, body: any): Promise<boolean> {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => {
      if (!response.ok) return false;
      return true;
    })
    .catch(() => {
      console.warn("Ping failed");
      return false;
    });
}
