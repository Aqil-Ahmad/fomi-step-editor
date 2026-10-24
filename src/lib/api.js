function withFailure(path, failKey) {
  const requested = new URLSearchParams(window.location.search).get("fail");
  return requested === failKey ? `${path}?fail=1` : path;
}

async function request(path, { method = "POST", body, failKey } = {}) {
  const response = await fetch(failKey ? withFailure(path, failKey) : path, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Something went wrong. Try again.");
  return data;
}

export const api = {
  createStep: (projectId, body) => request(`/api/projects/${projectId}/steps`, { body, failKey: "step" }),
  updateStep: (projectId, step) =>
    request(`/api/projects/${projectId}/steps/${step.id}`, { body: { step }, failKey: "step" }),
  runChecks: (projectId, body) => request(`/api/projects/${projectId}/checks`, { body, failKey: "checks" }),
  startApply: (projectId) => request(`/api/projects/${projectId}/apply`, { failKey: "apply" }),
  getJob: (jobId) => request(`/api/jobs/${jobId}`, { method: "GET" }),
  fixPhoto: (projectId, photoId, mode) =>
    request(`/api/projects/${projectId}/photos/${photoId}/restore`, { body: { mode }, failKey: "fix" }),
  exportPhotos: (projectId, body) => request(`/api/projects/${projectId}/export`, { body, failKey: "export" }),
};
