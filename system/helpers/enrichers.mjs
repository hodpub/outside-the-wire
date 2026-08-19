const TRACK_ENRICHER_PATTERN = /\[\[\/track(?:er)?\s+(.+?)\s+([+-]?\d+)\s*\]\](?:\{([^{}]+)\})?/gi;
const TRACK_LINK_SELECTOR = "a.otw-track-link";

export function registerEnrichers() {
  CONFIG.TextEditor.enrichers.push({
    pattern: TRACK_ENRICHER_PATTERN,
    enricher: enrichTrackLink,
  });
}

export function registerEnricherActions() {
  document.addEventListener("click", onTrackLinkClick);
}

/**
 * Adjust a named world track by a specific value.
 *
 * @param {string} trackName The displayed name of the track.
 * @param {number|string} value The amount to add to the current value.
 * @returns {Promise<unknown>}
 */
export async function updateTrackByName(trackName, value) {
  if (!game.user.isGM) {
    return ui.notifications.warn(game.i18n.localize("OUTSIDE_THE_WIRE.Enrichers.Track.gmOnly"));
  }

  const normalizedName = trackName.trim().toLocaleLowerCase();
  const trackItem = game.items.find(item => item.type === "track");
  const track = trackItem
    ? Object.values(trackItem.system.tracks).find(candidate => candidate.name.trim().toLocaleLowerCase() === normalizedName)
    : null;

  if (!track) {
    return ui.notifications.error(game.i18n.format("OUTSIDE_THE_WIRE.Enrichers.Track.notFound", { name: trackName }));
  }

  const targetValue = track.current + Number(value);
  if (!Number.isInteger(targetValue)) {
    return ui.notifications.error(game.i18n.format("OUTSIDE_THE_WIRE.Enrichers.Track.invalidValue", { value }));
  }

  return trackItem.system.updateCurrentValue(track.id, targetValue);
}

/** @param {RegExpMatchArray} match */
function enrichTrackLink(match) {
  const trackName = stripMatchingQuotes(match[1].trim());
  const value = Number(match[2]);
  const signedValue = value >= 0 ? `+${value}` : String(value);
  const label = match[3]?.trim() || `${trackName.titleCase()} ${signedValue}`;
  const link = document.createElement("a");

  link.classList.add("content-link", "otw-track-link");
  link.dataset.trackName = trackName;
  link.dataset.trackValue = String(value);
  link.setAttribute("role", "button");
  link.setAttribute("aria-label", game.i18n.format("OUTSIDE_THE_WIRE.Enrichers.Track.adjustValue", {
    name: trackName,
    value,
  }));

  const icon = document.createElement("i");
  icon.classList.add("fa-solid", "fa-clock");
  link.append(icon, document.createTextNode(label));
  return link;
}

/** @param {MouseEvent} event */
function onTrackLinkClick(event) {
  const link = event.target.closest?.(TRACK_LINK_SELECTOR);
  if (!link) return;

  event.preventDefault();
  event.stopPropagation();
  void updateTrackByName(link.dataset.trackName, link.dataset.trackValue);
}

function stripMatchingQuotes(value) {
  const first = value.at(0);
  const last = value.at(-1);
  return first === last && (first === "\"" || first === "'") ? value.slice(1, -1).trim() : value;
}
