function variantSrc(pattern, keysOn) {
  return pattern.replace(/\{(\w+)\}/g, (_, key) => (keysOn.has(key) ? "1" : "0"));
}

export function allVariantSources(editor) {
  const combos = editor.variantKeys.reduce(
    (sets, key) => sets.flatMap((set) => [set, new Set([...set, key])]),
    [new Set()],
  );
  return combos.map((keysOn) => variantSrc(editor.variantPattern, keysOn));
}

export function composePhoto(editor, steps, upTo) {
  const applied = new Set(steps.slice(0, upTo).filter((step) => step.visible));
  const keysOn = new Set();
  const layers = [{ id: "base", src: variantSrc(editor.variantPattern, keysOn) }];
  const adjustments = [];
  const overlays = [];

  for (const step of steps) {
    const isApplied = applied.has(step);

    if (step.effect.kind === "variant" && isApplied) {
      keysOn.add(step.effect.key);
      layers.push({ id: step.id, src: variantSrc(editor.variantPattern, keysOn), stepId: step.id, strength: step.strength });
    }

    if (step.effect.kind === "overlay") {
      const showsWhenOff = step.effect.showWhen === "off";
      if (isApplied) {
        overlays.push({ id: step.id, src: step.effect.src, stepId: step.id, strength: step.strength, invert: showsWhenOff });
      } else if (showsWhenOff) {
        overlays.push({ id: step.id, src: step.effect.src });
      }
    }

    if (step.adjust && isApplied) {
      adjustments.push({
        id: `${step.id}-adjust`,
        stepId: step.id,
        region: step.region,
        filter: step.adjust,
        strength: step.strength,
      });
    }
  }

  return { layers, overlays, adjustments, topSrc: layers.at(-1).src };
}

export function compareTargetLabel(upTo) {
  return upTo === 0 ? "Original" : `After step ${upTo}`;
}
