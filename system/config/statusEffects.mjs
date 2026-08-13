export function registerStatusEffects() {
  const conditionPath = "systems/outside-the-wire/assets/icons/";
  CONFIG.statusEffects = [
    {
      id: "dead",
      img: `${conditionPath}tombstone.svg`,
      name: "EFFECT.StatusDead"
    },
    {
      id: "stun",
      img: `${conditionPath}daze.svg`,
      name: "EFFECT.StatusStunned",
      changes: [
        {
          key: "system.health.stunned",
          mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.override,
          value: true
        }
      ]
    },
    {
      id: "mobility",
      img: `${conditionPath}despair.svg`,
      name: "OUTSIDE_THE_WIRE.Health.mobility",
      changes: [
        {
          key: "system.health.mobility",
          mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.override,
          value: true
        }
      ]
    },
    {
      id: "mobilityArm",
      img: `${conditionPath}arm-bandage.svg`,
      name: "OUTSIDE_THE_WIRE.Health.mobilityArm",
      changes: [
        {
          key: "system.health.mobilityArm",
          mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.override,
          value: true
        }
      ]
    },
    {
      id: "mobilityLeg",
      img: `${conditionPath}knee-bandage.svg`,
      name: "OUTSIDE_THE_WIRE.Health.mobilityLeg",
      changes: [
        {
          key: "system.health.mobilityLeg",
          mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.override,
          value: true
        }
      ]
    },
    {
      id: "unconscious",
      img: `${conditionPath}sleepy.svg`,
      name: "EFFECT.StatusUnconscious",
      changes: [
        {
          key: "system.health.unconscious",
          mode: CONST.ACTIVE_EFFECT_CHANGE_TYPES.override,
          value: true
        }
      ]
    }
  ];
}