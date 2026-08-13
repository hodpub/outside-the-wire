import { OUTSIDE_THE_WIRE } from "../../config/_outside-the-wire.mjs";
import { extractTextFromHtml } from "../../helpers/utils.mjs";

import { HodLogger } from "../../../lib/hod-logger/logger.mjs";

const { HandlebarsApplicationMixin, ApplicationV2, DialogV2 } = foundry.applications.api;

const logger = new HodLogger("creator");

const creatorTables = {
  motivationTable: "motivationTable",
  trademarkTable: "trademarkTable",
  conflictsTable: "conflictsTable",
  deploymentsNumberTable: "deploymentsNumberTable",
  deploymentsAwardsTable: "deploymentsAwardsTable",
  deploymentsLocationTable: "deploymentsLocationTable",
  deploymentsSchoolTable: "deploymentsSchoolTable",
  deploymentsSofTable: "deploymentsSofTable",
  deploymentsSurvivalTable: "deploymentsSurvivalTable",
};
const creatorItems = {
  eodItem: "eodItem",
  jtacItem: "jtacItem",
  spyItem: "spyItem",
  rangerItem: "rangerItem",
};

export function registerCreatorSettings() {
  for (let k of Object.keys(creatorTables)) {
    game.settings.register(OUTSIDE_THE_WIRE.ID, k, {
      name: `OUTSIDE_THE_WIRE.Settings.${k}.label`,
      config: true,
      scope: 'world',
      type: new foundry.data.fields.DocumentUUIDField({ type: "RollTable" }),
    });
  }
  for (let k of Object.keys(creatorItems)) {
    game.settings.register(OUTSIDE_THE_WIRE.ID, k, {
      name: `OUTSIDE_THE_WIRE.Settings.${k}.label`,
      config: true,
      scope: 'world',
      type: new foundry.data.fields.DocumentUUIDField({ type: "Item" }),
    });
  }
}

export default class OutsideTheWireCreatorDialog extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(actor, options) {
    options ??= {};
    options.window ??= {};
    options.window.title = `Character Creator: ${actor.name}`;
    super(options);
    this.data = {
      basicInformation: {},
      background: {},
      specialty: {},
      attributes: {
        choice: null,
        values: [],
        minRollTotal: 15,
        maxPoints: 22,
        currentPoints: 0,
      },
      deployment: {},
      tours: [],
    };
    this.originalActor = actor;
    this.actor = actor.toObject().system;
    this.actor.tours = 0;
    this.actor.deployments = 0;

    this.configuration = {};
    for (let k of Object.keys(creatorTables)) {
      this._setConfigurationUuid(k);
    }
    for (let k of Object.keys(creatorItems)) {
      this._setConfigurationUuid(k);
    }
  }

  _setConfigurationUuid(key) {
    const value = game.settings.get(OUTSIDE_THE_WIRE.ID, key);
    if (!value) {
      const tableName = game.i18n.localize(`OUTSIDE_THE_WIRE.Settings.${key}.label`);
      logger.notifyError(`The "${tableName}" is not configured.`);
      throw new Error(`The "${tableName}" is not configured.`);
    }
    this.configuration[key] = value;
  }

  static DEFAULT_OPTIONS = {
    classes: ['outside-the-wire', 'sheet', 'item', 'creator'],
    position: {
      width: 600,
      height: 600,
    },
    window: {
      title: "Character Creator",
      icon: "fa-solid fa-pen",
      resizable: true
    },
    actions: {
      // Navigation
      moveNext: this._moveNext,
      movePrevious: this._movePrevious,
      // Personel
      rollMotivation: this._rollMotivation,
      rollTrademark: this._rollTrademark,
      rollConflict: this._rollConflict,
      // Attributes
      attributeRoll: this._attributeRoll,
      attributeFill: this._attributeFill,
      attributeUp: this._attributeUp,
      attributeDown: this._attributeDown,
      attributeNext: this._attributeNext,
      // Deployments
      deploymentRollOnlyNumber: this._deploymentRollOnlyNumber,
      deploymentRollEverything: this._deploymentRollEverything,
    },
    tag: "form",
    form: {
      handler: this.formHandler,
      submitOnChange: true,
    },
  };

  static PARTS = {
    header: {
      template: 'systems/outside-the-wire/templates/actor/creator/header.hbs',
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
      // classes: ['sysclass'], // Optionally add extra classes to the part for extra customization
    },
    personel: {
      template: 'systems/outside-the-wire/templates/actor/creator/personel.hbs',
      scrollable: [''],
    },
    background: {
      template: 'systems/outside-the-wire/templates/actor/creator/background.hbs',
      scrollable: [''],
    },
    specialty: {
      template: 'systems/outside-the-wire/templates/actor/creator/specialty.hbs',
      scrollable: [''],
    },
    deployments: {
      template: 'systems/outside-the-wire/templates/actor/creator/deployments.hbs',
      scrollable: [''],
    },
    attributes: {
      template: 'systems/outside-the-wire/templates/actor/creator/attributes.hbs',
      templates: [
        // 'systems/outside-the-wire/templates/partials/full-values.hbs',
        'systems/outside-the-wire/templates/partials/field.hbs'
      ],
      scrollable: [''],
    },
  };

  static TABS = {
    primary: {
      tabs: [
        {
          id: "personel",
          label: "OUTSIDE_THE_WIRE.Actor.Tabs.Personal",
          tooltip: "OUTSIDE_THE_WIRE.Actor.Tabs.Personal",
          icon: "fa-solid fa-user"
        },
        {
          id: "background",
          label: "OUTSIDE_THE_WIRE.Creator.tab.background",
          tooltip: "OUTSIDE_THE_WIRE.Creator.tab.background",
          icon: "fa-solid fa-rectangle-vertical-history"
        },
        {
          id: "specialty",
          label: "OUTSIDE_THE_WIRE.Creator.tab.specialty",
          tooltip: "OUTSIDE_THE_WIRE.Creator.tab.specialty",
          icon: "fa-solid fa-person-military-rifle"
        },
        {
          id: "attributes",
          label: "OUTSIDE_THE_WIRE.Attributes.label",
          tooltip: "OUTSIDE_THE_WIRE.Attributes.label",
          icon: "fa-solid fa-file-lines"
        },
        {
          id: "deployments",
          label: "OUTSIDE_THE_WIRE.Creator.tab.deployments",
          tooltip: "OUTSIDE_THE_WIRE.Creator.tab.deployments",
          icon: "fa-solid fa-globe"
        },
      ],
      initial: "deployments", // Set the initial tab
      // initial: "personel", // Set the initial tab
    },
  };

  async _prepareContext(options) {
    logger.debug("prepare context", this, options);
    if (options.isFirstRender) {

      if (this.originalActor.items.size) {
        if (await foundry.applications.api.DialogV2.confirm({
          content: `This actor already have items on it. Do you want to continue with the creator? This will delete the items it already has.`,
          rejectClose: false,
          modal: true
        }))
          await this._deleteAllItems();
        else
          throw new Error("Creator aborted");
      }
      await this._prepareItemData();
    }
    await this._prepareBasicInformationData();
    await this._prepareBackgroundData();
    await this._prepareSpecialtyData();
    await this._prepareAttributesData();
    await this._prepareDeploymentsData();

    const context = {
      /** @type {Record<string, foundry.applications.types.ApplicationTab} */
      tabs: this._prepareTabs("primary"),
      data: this.data,
      actor: this.actor,
      config: OUTSIDE_THE_WIRE,
    };
    return context;
  }

  async _preparePartContext(partId, context) {
    switch (partId) {
      default:
        context.tab = context.tabs[partId];
    }
    return context;
  }

  async _prepareItemData() {
    const packs = game.packs.filter(it => it.documentName == "Item");
    let backgrounds = game.items.filter(it => it.type == "background");
    let specialties = game.items.filter(it => it.type == "specialty" && it.system.initial);

    for (const pack of packs) {
      const newBackgrounds = pack.index.filter(it => it.type == "background");
      for (const item of newBackgrounds) {
        const current = await fromUuid(item.uuid);
        backgrounds.push(current);
      }

      const newSpecialties = pack.index.filter(it => it.type == "specialty");
      for (const item of newSpecialties) {
        const current = await fromUuid(item.uuid);
        if (!current.system.initial)
          continue;

        specialties.push(current);
      }
    }

    this.data.background.backgrounds = backgrounds.sort((a, b) => a.name.localeCompare(b.name));
    this.actor.background = this.data.background.backgrounds[0].uuid;
    logger.debug("item data", this);
    this.data.specialty.specialties = specialties.sort((a, b) => a.name.localeCompare(b.name));
    this.actor.specialty = this.data.specialty.specialties[0].uuid;
    logger.debug("item data", this);
  }

  async _drawFromTable(settingId) {
    const uuid = this.configuration[settingId];
    const table = await fromUuid(uuid);
    const result = await table.draw();
    return result;
  }

  async _getItemFromTable(tableSettingId) {
    const drawResult = await this._drawFromTable(tableSettingId);
    const item = await fromUuid(drawResult.results[0].documentUuid);
    return item;
  }

  /* ====== PERSONAL ====== */
  async _prepareBasicInformationData() {
    this.data.basicInformation.ready =
      this.actor.nickname &&
      this.actor.age.value &&
      this.actor.motivation &&
      this.actor.trademark &&
      this.actor.conflict;
  }
  static async _rollMotivation() {
    const result = await this._drawFromTable(creatorTables.motivationTable);
    this.actor.motivation = result.results[0].name;
    logger.debug(result, 1);
    this.render(true);
  }
  static async _rollTrademark() {
    const result = await this._drawFromTable(creatorTables.trademarkTable);
    this.actor.trademark = result.results[0].name;
    logger.debug(result, 1);
    this.render(true);
  }
  static async _rollConflict() {
    const result = await this._drawFromTable(creatorTables.conflictsTable);
    this.actor.conflict = extractTextFromHtml(result.results[0].description);
    logger.debug(result, 1);
    this.render(true);
  }

  async _storeHook(func) {
    const originalHook = this.originalActor.system.hook;
    const result = await func();
    if (result.system.usedHook)
      this.actor.hook = this.originalActor.system.hook;

    await this.originalActor.update({ "system.hook": originalHook });
    logger.debug("HOOK", { original: originalHook, new: this.actor.hook });
    return result;
  }

  /* ====== BACKGROUND ====== */
  async _prepareBackgroundData() {
    this.data.background.ready = this.actor.background;
  }

  /* ====== SPECIALTY ====== */
  async _prepareSpecialtyData() {
    this.data.specialty.ready = this.actor.specialty;
  }

  async _specialtyFinish() {
    if (this.actor.previousSpecialty) {
      if (this.actor.previousSpecialty == foundry.utils.parseUuid(this.actor.specialty).id)
        return;

      const previousSpecialty = this.originalActor.items.get(this.actor.previousSpecialty);
      await previousSpecialty.delete();
    }

    const specialty = (await fromUuid(this.actor.specialty)).toObject();
    specialty.sort = 1000;
    const newSpecialty = await this._storeHook(async () => {
      return await Item.implementation.create(specialty, { parent: this.originalActor, keepId: true });
    });
    this.actor.previousSpecialty = newSpecialty.id;
  }

  /* ====== ATTRIBUTE ====== */
  async _prepareAttributesData() {
    this.data.attributes.currentPoints = Object.keys(this.actor.attributes).reduce((acc, cur) => {
      return acc + this.actor.attributes[cur].value;
    }, 0);
    this.data.attributes.status = "";
    if (this.data.attributes.choice == "roll" || this.data.attributes.currentPoints == this.data.attributes.maxPoints)
      this.data.attributes.status = `style="color: green"`;
    else if (this.data.attributes.currentPoints > this.data.attributes.maxPoints)
      this.data.attributes.status = `style="color: red"`;

    this.data.attributes.ready = this.data.attributes.choice == "roll" || this.data.attributes.currentPoints == this.data.attributes.maxPoints;
  }
  static async _attributeRoll() {
    const roll = await new Roll("4d10").roll();
    logger.debug("Attribute Roll", roll);
    const results = roll.dice[0].results.map(x => Math.max(x.result, 3));
    const total = Math.sumPrecise(results);
    if (total < this.data.attributes.minRollTotal &&
      await foundry.applications.api.DialogV2.confirm({
        content: `You rolled below the minimum threshold (${total} < ${this.data.attributes.minRollTotal}). Do you want to use the Fill mode intead?`,
        rejectClose: false,
        modal: true
      })
    ) {
      logger.debug("Switching to Fill", total);
      return this._setAttributeFill();
    }

    this.data.attributes.choice = "roll";
    this.actor.attributes.strength.value = results[0];
    this.actor.attributes.agility.value = results[1];
    this.actor.attributes.wisdom.value = results[2];
    this.actor.attributes.knowledge.value = results[3];

    this.render(true);
  }
  static async _attributeUp(event) {
    return this._moveAttribute(event, true);
  }
  static async _attributeDown(event) {
    return this._moveAttribute(event, false);
  }
  async _moveAttribute(event, upDirection) {
    const dataset = event.srcElement.dataset;
    const attributes = OUTSIDE_THE_WIRE.ACTOR.ATTRIBUTES;
    const originalIndex = attributes.indexOf(dataset.currentAttribute);
    const swapIndex = originalIndex + (upDirection ? -1 : 1);
    const swapAttribute = attributes[swapIndex];
    const originalValue = this.actor.attributes[dataset.currentAttribute].value;
    this.actor.attributes[dataset.currentAttribute].value = this.actor.attributes[swapAttribute].value;
    this.actor.attributes[swapAttribute].value = originalValue;
    this.render(true);
  }
  static async _attributeFill() {
    return this._setAttributeFill();
  }
  async _setAttributeFill() {
    logger.debug("Attribute Fill");
    this.data.attributes.choice = "fill";
    this.render(true);
  }

  /* ====== DEPLOYMENTS ====== */
  async _prepareDeploymentsData() {
    this.data.deployment.ready = this.actor.tours > 0;
  }

  async _createTour(choice) {
    const drawResult = await this._drawFromTable(creatorTables.deploymentsNumberTable);
    const result = drawResult.results[0].name;
    const rollTotal = drawResult.roll.total;

    const tour = {
      choice,
      numbers: result,
      size: [2, 9, 10].indexOf(rollTotal) > -1 ? 2 : 1,
      officePromotion: rollTotal == 1,
      promotion: rollTotal > 1 && [5, 6].indexOf(rollTotal) == -1,
      eod: [2, 9, 10].indexOf(rollTotal) > -1,
      deployments: [],
    };

    this.actor.tours++;
    this.data.tours.push(tour);
    return tour;
  }

  async _deploymentRollNumber() {
    const drawResult = await this._drawFromTable(creatorTables.deploymentsNumberTable);
    const result = drawResult.results[0].name;
    const rollTotal = drawResult.roll.total;
    this.data.deployment.numbers = result;
    this.data.deployment.size = [2, 9, 10].indexOf(rollTotal) > -1 ? 2 : 1;
    this.data.deployment.officePromotion = rollTotal == 1;
    this.data.deployment.promotion = rollTotal > 1 && [5, 6].indexOf(rollTotal) == -1;
    this.data.deployment.eod = [2, 9, 10].indexOf(rollTotal) > -1;
    this.data.deployment.deployments = [];
  }

  async _handleSpy(index) {
    if (this.actor.spy || !this.actor.sofDeployed)
      return;

    if (!(await foundry.applications.api.DialogV2.confirm({
      content: `Your character was invited to be a Spy. Do you want to accept it?`,
      rejectClose: false,
      modal: true
    })))
      return;

    this.actor.spy = true;
    const spyItem = await fromUuid(this.configuration[creatorItems.spyItem]);
    const obj = spyItem.toObject();
    obj.sort = this.actor.tours * 100000 + index * 1000 + 3;
    await Item.implementation.create(obj, { parent: this.originalActor, keepId: true });
  }

  async _handleSof() {
    if (!this.actor.sof)
      return;

    this.actor.sofDeployed = true;

    const specialties = this.originalActor.items.filter(it => it.type == "specialty");
  }

  async _handleRanger() {
    if (!this.actor.sof) {
      if (await foundry.applications.api.DialogV2.confirm({
        content: `Your character was invited to SOF. Do you want to accept it?`,
        rejectClose: false,
        modal: true
      })) {
        this.actor.sof = true;
      }
    }
    else
      return;

  }

  async _drawSchool() {
    const schoolTable = this.actor.sof ? creatorTables.deploymentsSofTable : creatorTables.deploymentsSchoolTable;
    const schoolDraw = await this._drawFromTable(schoolTable);

    const buttons = [];
    for (const r of schoolDraw.results) {
      if (this.originalActor.items.get(r.documentId))
        continue;
      buttons.push({
        action: r.documentUuid, label: r.name, documentId: r.documentId
      });
    }

    let schoolChoose;
    if (buttons.length == 0)
      return this._drawSchool();
    if (buttons.length == 1)
      schoolChoose = buttons[0].action;
    else {
      schoolChoose = await DialogV2.wait({
        content: `Select which School you want to join:`,
        rejectClose: false,
        modal: true,
        buttons
      });
    }
    return schoolChoose;
  }

  async _getSchool(index) {
    const schoolUuid = await this._drawSchool();
    const schoolItem = await fromUuid(schoolUuid);
    const obj = schoolItem.toObject();
    obj.sort = this.actor.tours * 100000 + index * 1000 + 1;
    await Item.implementation.create(obj, { parent: this.originalActor, keepId: true });

    return schoolItem;
  }

  async _createFullDeployment(tour) {
    const index = this.actor.deployments;
    const locationItem = await this._getItemFromTable(creatorTables.deploymentsLocationTable);
    const awartItem = await this._getItemFromTable(creatorTables.deploymentsAwardsTable);
    const survival = await this._drawFromTable(creatorTables.deploymentsSurvivalTable);
    const schoolItem = await this._getSchool(index);
    const deployment = await Item.implementation.create({
      name: `Deployment #${index} to ${locationItem.name}`,
      type: "deployment",
      "system.survival": survival.results[0].name,
      "system.schoolName": schoolItem.name,
      "system.school": schoolItem.uuid,
      sort: this.actor.tours * 100000 + index * 1000
    }, { parent: this.originalActor });
    await deployment.system.updateBasedOnItem(locationItem, false);
    await deployment.system.updateBasedOnItem(awartItem, false);

    tour.deployments.push(deployment);

    if (this.actor.sof)
      this.actor.sofDeployed = true;

    await this._handleSpy(index);

    if (schoolItem.uuid == this.configuration[creatorItems.rangerItem])
      await this._handleRanger();
  }

  async _setPromotion(tour) {
    const deployment = tour.deployments[0];
    if (tour.officePromotion)
      await deployment.update({ "system.rank.value": 2 });
    else if (tour.promotion)
      await deployment.update({ "system.rank.value": 1 });
  }

  async _setEodJtac(tour) {
    if (!tour.eod)
      return;

    const hasEod = this.originalActor.items.get(foundry.utils.parseUuid(this.configuration[creatorItems.eodItem]).id);
    const hasJtac = this.originalActor.items.get(foundry.utils.parseUuid(this.configuration[creatorItems.jtacItem]).id);
    if (hasEod && hasJtac)
      return;

    const eodJtacChoice = await DialogV2.wait({
      content: `Your character was invited to be a EOD/JTAC. Do you want to accept it and do more one deployment?`,
      rejectClose: false,
      modal: true,
      buttons: [
        {
          action: creatorItems.eodItem, label: "EOD", default: true, disabled: hasEod
        },
        {
          action: creatorItems.jtacItem, label: "JTAC", default: true, disabled: hasJtac
        },
        {
          action: "", label: "Don't Accept", default: true
        },
      ]
    });

    if (!eodJtacChoice)
      return;

    const choosenItem = await fromUuid(this.configuration[eodJtacChoice]);
    const obj = choosenItem.toObject();
    obj.sort = this.actor.tours * 100000 + 30000;
    await this._storeHook(async () => {
      return await Item.implementation.create(obj, { parent: this.originalActor, keepId: true });
    });
  }

  async _setSofSpecialty() {
    if (!this.actor.sofDeployed)
      return;

    const spyId = foundry.utils.parseUuid(this.configuration[creatorItems.spyItem]).id;
    const specialties = this.originalActor.items.filter(it =>
      it.type == "specialty" && !it.name.startsWith("SOF ") && it.id != spyId);

    if (specialties.length == 0)
      return;
    if (specialties.length == 1)
      return await specialties[0].system.convertToSof();

    const buttons = [];
    for (const specialty of specialties) {
      buttons.push({
        action: specialty.id, label: specialty.name
      });
    }

    const sofChoose = await DialogV2.wait({
      content: `Select which Specialty you want to upgrade to SOF:`,
      rejectClose: false,
      modal: true,
      buttons
    });

    if (!sofChoose)
      return;

    await this.originalActor.items.get(sofChoose).system.convertToSof();
  }

  static async _deploymentRollEverything() {
    const tour = await this._createTour("Roll Everything");

    for (let index = 0; index < tour.size; index++) {
      this.actor.deployments++;
      await this._createFullDeployment(tour, index);
    }
    await this._setPromotion(tour);
    await this._setEodJtac(tour);
    await this._setSofSpecialty();
    this.render(true);
  }
  static async _deploymentRollOnlyNumber() {
    const tour = await this._createTour("Roll only deployment numbers");

    for (let index = 0; index < tour.size; index++) {
      this.actor.deployments++;
      const deployment = await Item.implementation.create(
        {
          name: `Deployment #${this.actor.deployments}`,
          type: "deployment",
          "system.tour": `Tour #${this.data.tours.length}`
        },
        { parent: this.originalActor }
      );
      tour.deployments.push(deployment);
    }
    await this._setPromotion(tour);
    await this._setEodJtac(tour);
    this.render(true);
  }

  /* ====== NAVIGATION ====== */
  static async _moveNext() {
    return this._move(false);
  }
  static async _movePrevious() {
    return this._move(true);
  }

  async _move(previous) {
    const options = this._getTabsConfig("primary").tabs.map(x => x.id);
    const current = this.tabGroups["primary"];
    const currentIndex = options.indexOf(current);

    if (!previous)
      await this[`_${current}Finish`]?.();

    const targetIndex = currentIndex + (previous ? -1 : 1);
    if (targetIndex == -1)
      return;
    this.tabGroups["primary"] = options[targetIndex];
    this.render(true);
  }

  /* ====== FORM HANDLER ====== */
  async _setTab(next) {
    this.tabGroups["primary"] = next;
    this.render(true);
  }

  static async formHandler(event, form, formData) {
    return this._formHandler(event, form, formData);
  }

  async _formHandler(event, form, formData) {
    if (event.type == "change")
      return this._updateDialog(formData);

    if (event.type == "submit")
      return this._endCreator(event, form, formData);

    console.error("Unhandled event type in OutsideTheWireRollDialog:", event.type);
    return;
  }

  async _updateDialog(formData) {
    const changes = foundry.utils.expandObject(formData.object);
    this.actor = foundry.utils.mergeObject(this.actor, changes);
    logger.debug("Update Dialog", changes, this.actor);
    this.render(true);
  }

  async _endCreator(event, form, formData) {
    logger.debug("End Creator", event, form, formData, this.actor);

    const itemsToCreate = [
      foundry.utils.mergeObject((await fromUuid(this.actor.background)).toObject(), { sort: 1 })
    ];

    await this.originalActor.createEmbeddedDocuments("Item", itemsToCreate);

    // TODO: if SOF, update all specialties to SOF

    delete this.actor.background;
    delete this.actor.specialty;
    delete this.actor.previousSpecialty;
    delete this.actor.deployments;
    this.actor.editMode = false;


    await this.originalActor.update({ "system": this.actor });
    await this.originalActor.sheet.render(true);
    await this.close({ submitted: true });
  }

  async _preClose(options) {
    logger.debug("pre close", options);
    if (options.submitted)
      return;

    //TODO: check if this is the best way to handle this idea
    if (!(await foundry.applications.api.DialogV2.confirm({
      content: `Do you really want to close the creator helper? This will lose all the data you did until now`,
      rejectClose: false,
      modal: true
    }))) {
      throw new Error("DO NOT Close");
    }
    await this._deleteAllItems();
  }

  async _deleteAllItems() {
    const itemsToDelete = this.originalActor.items.contents.map(x => x.id);
    await this.originalActor.deleteEmbeddedDocuments("Item", itemsToDelete);
  }
}