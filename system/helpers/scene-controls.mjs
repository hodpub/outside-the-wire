const TRACK_CONTROL_SELECTOR = "button[data-otw-control='tracks']";
const JOURNAL_CONTROL_SELECTOR = "button.control.ui-control.layer.fa-bookmark";

/** Register the Tracks & Clocks shortcut in Foundry's scene controls. */
export function registerSceneControls() {
  Hooks.on("renderSceneControls", (_application, element) => {
    if (element.querySelector(TRACK_CONTROL_SELECTOR)) return;

    const journalControl = element.querySelector(JOURNAL_CONTROL_SELECTOR);
    const journalControlItem = journalControl?.closest("li");
    if (!journalControlItem) return;

    const label = game.i18n.localize("OUTSIDE_THE_WIRE.Controls.openTracks");
    const listItem = document.createElement("li");
    listItem.className = journalControlItem.className;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "control ui-control layer icon fa-solid fa-clock";
    button.dataset.otwControl = "tracks";
    button.dataset.tooltip = label;
    button.setAttribute("aria-label", label);
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      void openTrackSheet();
    });

    listItem.append(button);
    journalControlItem.insertAdjacentElement("afterend", listItem);
  });
}

/** Open the world's singleton Tracks & Clocks item sheet. */
export async function openTrackSheet() {
  const trackItem = game.items.find(item => item.type === "track");
  if (!trackItem) {
    return ui.notifications.warn(game.i18n.localize("OUTSIDE_THE_WIRE.Controls.tracksNotFound"));
  }

  return trackItem.sheet.render({ force: true });
}
