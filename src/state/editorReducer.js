const HISTORY_LIMIT = 50;

export function createEditorState(project, initialChecks) {
  const steps = project.look.steps;
  const active = steps.find((step) => step.suggestions) ?? steps[0];

  return {
    doc: { steps, locks: project.locks, regions: [] },
    past: [],
    future: [],
    activeStepId: active.id,
    selection: active.region,
    bubble: { mode: "update" },
    tool: "select",
    compareOn: true,
    compare: { left: 0, right: steps.length },
    crop: "4:5",
    processing: null,
    stepError: null,
    lockNotice: null,
    checks: { status: "done", results: initialChecks, afterStep: steps.length, runId: 0 },
  };
}

export function stepForRegion(steps, region) {
  return steps.findLast((step) => step.region === region);
}

export function contentLockFor(locks, region) {
  return locks.find((lock) => lock.region === region && lock.kind === "content");
}

function patchStep(doc, stepId, patch) {
  return { ...doc, steps: doc.steps.map((step) => (step.id === stepId ? { ...step, ...patch } : step)) };
}

function syncWithDoc(state, doc) {
  const followsLatest = state.compare.right === state.doc.steps.length;
  const activeExists = doc.steps.some((step) => step.id === state.activeStepId);

  return {
    ...state,
    doc,
    activeStepId: activeExists ? state.activeStepId : doc.steps.at(-1)?.id,
    compare: {
      left: Math.min(state.compare.left, doc.steps.length),
      right: followsLatest ? doc.steps.length : Math.min(state.compare.right, doc.steps.length),
    },
  };
}

function commit(state, doc, previous = state.doc) {
  return {
    ...syncWithDoc(state, doc),
    past: [...state.past, previous].slice(-HISTORY_LIMIT),
    future: [],
  };
}

function moveItem(items, from, to) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function select(state, region) {
  if (contentLockFor(state.doc.locks, region)) {
    return { ...state, selection: null, bubble: null, lockNotice: region, stepError: null };
  }
  const step = stepForRegion(state.doc.steps, region);
  return {
    ...state,
    selection: region,
    activeStepId: step?.id ?? state.activeStepId,
    bubble: { mode: step ? "update" : "new" },
    lockNotice: null,
    stepError: null,
  };
}

export function editorReducer(state, action) {
  const { doc } = state;

  switch (action.type) {
    case "step/toggle": {
      const step = doc.steps.find((item) => item.id === action.stepId);
      return commit(state, patchStep(doc, action.stepId, { visible: !step.visible }));
    }

    case "step/patch":
      return commit(state, patchStep(doc, action.stepId, action.patch));

    case "step/strengthCommitted": {
      if (action.from === action.to) return state;
      const previous = patchStep(doc, action.stepId, { strength: action.from });
      return commit(state, patchStep(doc, action.stepId, { strength: action.to }), previous);
    }

    case "step/activate": {
      const step = doc.steps.find((item) => item.id === action.stepId);
      if (!step) return state;
      return {
        ...state,
        activeStepId: step.id,
        selection: step.region,
        bubble: null,
        lockNotice: null,
        stepError: null,
      };
    }

    case "step/move": {
      const from = doc.steps.findIndex((step) => step.id === action.stepId);
      const to = from + action.offset;
      if (from < 0 || to < 0 || to >= doc.steps.length) return state;
      return commit(state, { ...doc, steps: moveItem(doc.steps, from, to) });
    }

    case "step/reorder": {
      const byId = new Map(doc.steps.map((step) => [step.id, step]));
      const steps = action.stepIds.map((id) => byId.get(id));
      const unchanged = steps.every((step, index) => step === doc.steps[index]);
      return unchanged ? state : commit(state, { ...doc, steps });
    }

    case "step/processing":
      return { ...state, processing: { stepId: action.stepId, region: action.region }, stepError: null };

    case "step/updated":
      return {
        ...commit(state, patchStep(doc, action.step.id, action.step)),
        processing: null,
        bubble: null,
      };

    case "step/created":
      return {
        ...commit(state, { ...doc, steps: [...doc.steps, action.step] }),
        activeStepId: action.step.id,
        processing: null,
        bubble: null,
      };

    case "step/failed":
      return { ...state, processing: null, stepError: action.message };

    case "selection/set":
      return select(state, action.region);

    case "selection/clear":
      return { ...state, selection: null, bubble: null, lockNotice: null, stepError: null };

    case "bubble/open":
      return {
        ...state,
        selection: state.selection ?? "whole",
        bubble: { mode: action.mode },
        lockNotice: null,
        stepError: null,
      };

    case "bubble/close":
      return { ...state, bubble: null, stepError: null };

    case "lock/add": {
      if (doc.locks.some((lock) => lock.region === action.region)) return state;
      const lock = {
        id: `lock-${action.region}`,
        title: action.title,
        detail: "Steps can't change this area",
        region: action.region,
        kind: "content",
      };
      const next = commit(state, { ...doc, locks: [...doc.locks, lock] });
      return state.selection === action.region ? { ...next, selection: null, bubble: null } : next;
    }

    case "lock/remove":
      return {
        ...commit(state, { ...doc, locks: doc.locks.filter((lock) => lock.id !== action.lockId) }),
        lockNotice: null,
      };

    case "lock/notice":
      return { ...state, lockNotice: action.region, bubble: action.region ? null : state.bubble };

    case "region/add":
      return select(commit(state, { ...doc, regions: [...doc.regions, action.region] }), action.region.id);

    case "tool/set":
      return { ...state, tool: action.tool, lockNotice: null };

    case "compare/toggle":
      return { ...state, compareOn: !state.compareOn };

    case "compare/target":
      return { ...state, compare: { ...state.compare, [action.side]: action.upTo } };

    case "crop/set":
      return { ...state, crop: action.crop };

    case "checks/started":
      return { ...state, checks: { ...state.checks, status: "running", runId: action.runId, error: null } };

    case "checks/finished":
      if (action.runId !== state.checks.runId) return state;
      return {
        ...state,
        checks: { status: "done", results: action.results, afterStep: action.afterStep, runId: action.runId },
      };

    case "checks/failed":
      if (action.runId !== state.checks.runId) return state;
      return { ...state, checks: { ...state.checks, status: "error", error: action.message } };

    case "history/undo": {
      if (state.past.length === 0) return state;
      return {
        ...syncWithDoc(state, state.past.at(-1)),
        past: state.past.slice(0, -1),
        future: [doc, ...state.future],
      };
    }

    case "history/redo": {
      if (state.future.length === 0) return state;
      return {
        ...syncWithDoc(state, state.future[0]),
        past: [...state.past, doc],
        future: state.future.slice(1),
      };
    }

    default:
      throw new Error(`Unknown editor action: ${action.type}`);
  }
}
