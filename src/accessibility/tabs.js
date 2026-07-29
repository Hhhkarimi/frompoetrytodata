const KEY_TO_OFFSET = {
  ArrowLeft: -1,
  ArrowRight: 1,
};

export function handleTabKeyDown(event, itemIds, currentId, onSelect) {
  const currentIndex = itemIds.indexOf(currentId);
  if (currentIndex < 0) return;

  let nextIndex;
  if (event.key === 'Home') nextIndex = 0;
  else if (event.key === 'End') nextIndex = itemIds.length - 1;
  else if (event.key in KEY_TO_OFFSET) {
    nextIndex = (currentIndex + KEY_TO_OFFSET[event.key] + itemIds.length) % itemIds.length;
  } else {
    return;
  }

  event.preventDefault();
  onSelect(itemIds[nextIndex]);
  const tabs = event.currentTarget.closest('[role="tablist"]')?.querySelectorAll('[role="tab"]');
  tabs?.[nextIndex]?.focus();
}
