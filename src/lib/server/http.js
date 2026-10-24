export function wait([minMs, maxMs]) {
  const duration = minMs + Math.random() * (maxMs - minMs);
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export function failureRequested(request) {
  return new URL(request.url).searchParams.has("fail");
}

export function errorResponse(message, status = 500) {
  return Response.json({ error: message }, { status });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
