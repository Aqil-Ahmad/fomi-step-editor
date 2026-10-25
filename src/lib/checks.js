export function evaluateChecks(checks, locks, photoResult) {
  const lockIds = new Set(locks.map((lock) => lock.id));
  const coveredLocks = new Set(checks.map((check) => check.lockId).filter(Boolean));

  const projectChecks = checks.filter(
    (check) => check.scope !== "shoot" && (!check.lockId || lockIds.has(check.lockId)),
  );
  const customLockChecks = locks
    .filter((lock) => !coveredLocks.has(lock.id))
    .map((lock) => ({ id: `lock-${lock.id}`, title: `${lock.title} unchanged`, passDetail: "0 changes" }));

  return [...projectChecks, ...customLockChecks].map((check) => {
    if (photoResult?.result === "drift" && photoResult.failedCheck === check.id) {
      return {
        id: check.id,
        title: check.title,
        status: "fail",
        detail: "1 change",
        reason: photoResult.reason,
        fix: photoResult.fix,
      };
    }
    return { id: check.id, title: check.title, status: "pass", detail: check.passDetail };
  });
}
