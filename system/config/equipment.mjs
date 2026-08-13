import { createListAndChoices } from "../helpers/config.mjs";

export const EQUIPMENT = {};

EQUIPMENT.LOADOUT = [
  "head",
  "clothing",
  "loadBearingVest",
  "daypack",
  "rucksack",
  "pockets",
  "munitions",
  "rifle",
  "pistol",
  "explosives",
];

EQUIPMENT.TYPE = {
  head: "head",
  clothing: "clothing",
  loadBearingVest: "loadBearingVest",
  daypack: "daypack",
  rucksack: "rucksack",
  pockets: "pockets",
  munitions: "munitions",
  // rifle: "rifle",
  // pistol: "pistol",
  // explosives: "explosives",
};

createListAndChoices(EQUIPMENT, "TYPE", EQUIPMENT.TYPE, "OUTSIDE_THE_WIRE.Item.Equipment.FIELDS.type");


EQUIPMENT.WEAPONS_TYPE = {
  rifle: "rifle",
  pistol: "pistol",
  // explosives: "explosives",
};

createListAndChoices(EQUIPMENT, "WEAPONS_TYPE", EQUIPMENT.WEAPONS_TYPE, "OUTSIDE_THE_WIRE.Item.Weapon.FIELDS.type");