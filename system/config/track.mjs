import { createListAndChoices } from "../helpers/config.mjs";

export const TRACK = {};

TRACK.VISIBILITY = {
  hidden: 0,
  showOnlyName: 10,
  visible: 100
};

createListAndChoices(TRACK, "VISIBILITY", TRACK.VISIBILITY, "OUTSIDE_THE_WIRE.Item.Track.FIELDS.tracks.element.visibility", { plural: "VISIBILITIES" });