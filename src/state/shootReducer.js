import { initialPhotoStatuses } from "@/lib/shoot";

export function createShootState(project) {
  return {
    statuses: initialPhotoStatuses(project),
    jobId: null,
    jobError: null,
    fixing: null,
    fixError: null,
    filter: "all",
    sizes: Object.fromEntries(project.exportSizes.map((size) => [size.id, size.checked])),
    onlyPassing: true,
  };
}

export function shootReducer(state, action) {
  switch (action.type) {
    case "job/queued":
      return {
        ...state,
        jobId: null,
        jobError: null,
        fixError: null,
        statuses: {
          ...state.statuses,
          ...Object.fromEntries(action.photoIds.map((id) => [id, { status: "queued", progress: 0, step: 0 }])),
        },
      };

    case "job/started":
      return { ...state, jobId: action.jobId };

    case "job/progress":
      return {
        ...state,
        jobId: action.done ? null : state.jobId,
        statuses: {
          ...state.statuses,
          ...Object.fromEntries(action.photos.map(({ id, ...entry }) => [id, entry])),
        },
      };

    case "job/failed":
      return {
        ...state,
        jobId: null,
        jobError: action.message,
        statuses: Object.fromEntries(
          Object.entries(state.statuses).map(([id, entry]) =>
            entry.status === "queued" || entry.status === "applying" ? [id, { status: "original", progress: 0 }] : [id, entry],
          ),
        ),
      };

    case "fix/started":
      return { ...state, fixing: { photoId: action.photoId, mode: action.mode }, fixError: null };

    case "fix/finished":
      return {
        ...state,
        fixing: null,
        statuses: { ...state.statuses, [action.photoId]: { status: "ready", progress: 1, restored: true } },
      };

    case "fix/failed":
      return { ...state, fixing: null, fixError: action.message };

    case "filter/set":
      return { ...state, filter: action.filter };

    case "size/toggle":
      return { ...state, sizes: { ...state.sizes, [action.sizeId]: action.checked } };

    case "export/onlyPassing":
      return { ...state, onlyPassing: action.value };

    default:
      throw new Error(`Unknown shoot action: ${action.type}`);
  }
}
