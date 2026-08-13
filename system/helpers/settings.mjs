import { OUTSIDE_THE_WIRE } from "../config/_outside-the-wire.mjs";

const settings = {};

export function registerSettings() {
  for (let k of Object.keys(settings)) {
    game.settings.register(OUTSIDE_THE_WIRE.ID, k, settings[k]);
  }
}