import { OUTSIDE_THE_WIRE } from "../../config/_outside-the-wire.mjs";

export default class OutsideTheWireItemTrack extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = [
    'OUTSIDE_THE_WIRE.Item.base',
    'OUTSIDE_THE_WIRE.Item.Track',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.tracks = new fields.TypedObjectField(new fields.SchemaField({
      id: new fields.StringField({ required: true, nullable: false }),
      name: new fields.StringField(),
      min: new fields.NumberField({ integer: true, nullable: true, initial: 0 }),
      max: new fields.NumberField({ integer: true, nullable: true, initial: 10 }),
      current: new fields.NumberField({ integer: true, nullable: true, initial: 5 }),
      color: new fields.ColorField({}),
      rollTableUuid: new fields.DocumentUUIDField({ type: "RollTable" }),
      visibility: new fields.NumberField({ integer: true, nullable: true, required: true, initial: OUTSIDE_THE_WIRE.TRACK.VISIBILITY.hidden, choices: OUTSIDE_THE_WIRE.TRACK.VISIBILITY_CHOICES }),
      disabled: new fields.BooleanField({ initial: false }),
    }));
    schema.editMode = new fields.BooleanField({ initial: true });

    return schema;
  }

  async _preUpdate(changes, options, user) {
    await super._preUpdate(changes, options, user);

    const tracks = changes.system?.tracks;
    if (!tracks)
      return;

    for (const trackId of Object.keys(tracks)) {
      const track = changes.system.tracks[trackId];
      if (!track.rollTableUuid || track.rollTableUuid == this.tracks[trackId].rollTableUuid)
        continue;

      const rollTable = await fromUuid(track.rollTableUuid);
      let min = 100000;
      let max = -100000;
      for (const result of rollTable.results) {
        min = Math.min(...result.range, min);
        max = Math.max(...result.range, max);
      }
      track.min = min;
      track.max = max;
      track.current = Math.min(Math.max(track.current, min), max);
    }
  }

  async updateCurrentValue(trackId, targetValue) {
    const track = this.tracks[trackId];
    targetValue = Math.min(Math.max(targetValue, track.min), track.max);
    await this.parent.update({ [`system.tracks.${trackId}.current`]: targetValue });
    if (!track.rollTableUuid)
      return;

    const rollTable = await fromUuid(track.rollTableUuid);
    const roll = await new Roll(targetValue.toString()).evaluate();
    const results = rollTable.getResultsForRoll(targetValue);
    const messageMode = this.visibility == OUTSIDE_THE_WIRE.TRACK.VISIBILITY.visible ? "" : "gm";
    return rollTable.draw({ roll, results, messageMode });
  }
  // get chatTemplate() {
  //   return "systems/outside-the-wire/templates/sidebar/chat/item.hbs";
  // };

  static DEFAULT_TRACKS = {
    "Command Confidence": {
      rollTableUuid: "Compendium.outside-the-wire.rolltables.RollTable.wkMJesD5GDhchKpn"
    },
    "Insurgent Activity": {
      rollTableUuid: "Compendium.outside-the-wire.rolltables.RollTable.r6WMpT3voDcFEv9b"
    },
    "Local Trust": {
      rollTableUuid: "Compendium.outside-the-wire.rolltables.RollTable.Dbmz4IDY7EWPzoOn"
    },
    "Sunlight Clock": {
      min: 1,
      current: 1,
      rollTableUuid: "Compendium.outside-the-wire.rolltables.RollTable.c4dowdUraJ9yjtjA"
    }
  };

  static async checkIfHasTrack() {
    if (!game.user.isGM)
      return;

    const currentTrack = game.items.filter(it => it.type == "track");
    if (currentTrack.length)
      return;

    const tracks = {};
    const defaultTracks = ["Command Confidence", "Insurgent Activity", "Local Trust"];
    for (const element of Object.keys(OutsideTheWireItemTrack.DEFAULT_TRACKS)) {
      const id = foundry.utils.randomID();
      const dt = OutsideTheWireItemTrack.DEFAULT_TRACKS[element];
      tracks[id] = foundry.utils.mergeObject({
        id,
        name: element,
        min: 0,
        max: 10,
        current: 5,
        visibility: OUTSIDE_THE_WIRE.TRACK.VISIBILITY.visible,
        disabled: true,
      }, dt);
    }

    return Item.implementation.create({
      name: "Tracks & Clocks",
      type: "track",
      ownership: {
        default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER
      },
      system: {
        editMode: false,
        tracks
      }
    });
  }

  async _preCreate(data, options, user) {
    const currentTrack = game.items.filter(it => it.type == "track");
    if (currentTrack.length) {
      ui.notifications.error("You already have a Track & Clock on this world");
      return false;
    }

    return super._preCreate(data, options, user);
  }

  async _preDelete(options, user) {
    ui.notifications.error("You can't delete the track");
    return false;
  }
}
