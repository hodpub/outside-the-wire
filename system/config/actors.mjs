import { createListAndChoices } from "../helpers/config.mjs";

export const ACTOR = {};

ACTOR.ATTRIBUTE = {
  strength: "strength",
  agility: "agility",
  wisdom: "wisdom",
  knowledge: "knowledge"
};

createListAndChoices(ACTOR, "ATTRIBUTE", ACTOR.ATTRIBUTE, "OUTSIDE_THE_WIRE.Actor.base.FIELDS.attributes");


ACTOR.ABILITIES = {
  prowess: "prowess",
  shooting: "shooting",
  instincts: "instincts",
  tactics: "tactics"
};

ACTOR.SKILL = {
  smallArms: "SmallArms",
  heavyArms: "HeavyArms",
  firstAid: "FirstAid",
  communications: "Communications",
  civilAffairs: "CivilAffairs",
  spying: "Spying",
  fires: "Fires",
  signalsIntel: "SignalsIntel",
  explosives: "Explosives",
};
createListAndChoices(ACTOR, "SKILL", ACTOR.SKILL, "OUTSIDE_THE_WIRE.Actor.base.FIELDS.skills");

ACTOR.SERVICE_BRANCHE = {
  army: "army",
  marines: "marines",
  navy: "navy",
};
createListAndChoices(ACTOR, "SERVICE_BRANCHE", ACTOR.SERVICE_BRANCHE, "OUTSIDE_THE_WIRE.Actor.base.FIELDS.serviceBranch");

ACTOR.PROTOTYPE_TOKEN = {
  soldier: {
    actorLink: true,
    disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
    sight: {
      enabled: true,
    },
  },
  insurgent: {
    actorLink: false,
    disposition: CONST.TOKEN_DISPOSITIONS.SECRET,
    sight: {
      enabled: true,
    },
  },
};

ACTOR.NATIONALITY = {
  'USA': 'USA',
  'United Kingdom': 'United Kingdom',
  'France': 'France',
  'Canada': 'Canada',
  'Norway': 'Norway',
  'Dutch': 'Dutch',
  'Australian': 'Australian',
  'German': 'German',
  'Spain': 'Spain',
  'The Philippines': 'The Philippines',
  'Polish': 'Polish',
  'Sweden': 'Sweden',
  'Brazil': 'Brazil',
  'New Zealand': 'New Zealand',
  'Panama': 'Panama',
};

ACTOR.TEST = {
  ...Object.keys(ACTOR.ABILITIES).reduce((obj, x) => {
    obj[`abilities.${x}.total`] = {
      label: `OUTSIDE_THE_WIRE.Abilities.${x}`,
      group: `OUTSIDE_THE_WIRE.Abilities.label`
    };
    return obj;
  }, {}),
  ...Object.keys(ACTOR.SKILL).reduce((obj, x) => {
    obj[`skills.${x}.total`] = {
      label: `OUTSIDE_THE_WIRE.Skills.${x}`,
      group: `OUTSIDE_THE_WIRE.Skills.label`
    };
    return obj;
  }, {}),
};