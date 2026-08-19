import { OUTSIDE_THE_WIRE } from "../config/_outside-the-wire.mjs";

const { api, sheets } = foundry.applications;
// const DragDrop = foundry.applications.ux.DragDrop;
const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheetV2}
 */
export class OutsideTheWireItemTrackSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
  constructor(options = {}) {
    super(options);
  }

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['outside-the-wire', 'item'],
    position: {
      width: 530,
      height: 600,
    },
    actions: {
      addTrack: this._addTrack,
      deleteTrack: this._deleteTrack,
      updateValue: this._updateValue,
      togglePlayEditMode: this._togglePlayEditMode,
    },
    form: {
      submitOnChange: true,
    },
    // Custom property that's merged into `this.options`
    // dragDrop: [{ dragSelector: '.draggable', dropSelector: null }],
  };

  /* -------------------------------------------- */

  /** @override */
  static PARTS = {
    header: {
      template: 'systems/outside-the-wire/templates/item/track/header.hbs',
    },
    tracks: {
      template: 'systems/outside-the-wire/templates/item/track/tracks.hbs',
      scrollable: [""]
    },
  };

  /** @override */
  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    // Not all parts always render
    options.parts = ['header', 'tracks'];
  }

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      isGM: game.user.isGM,
      // Add the item document.
      item: this.item,
      // Adding system and flags for easier access
      system: this.item.system,
      flags: this.item.flags,
      // Adding a pointer to CONFIG.OUTSIDE_THE_WIRE
      config: CONFIG.OUTSIDE_THE_WIRE,
      // You can factor out context construction to helper functions
      tabs: this._getTabs(options.parts),
      // Necessary for formInput and formFields helpers
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
    };
    await this.prepareItems(context);
    return context;
  }

  /** @override */
  async _preparePartContext(partId, context) {
    context.tab = context.tabs[partId];
    return context;
  }

  /**
   * Generates the data for the generic tab navigation template
   * @param {string[]} parts An array of named template parts to render
   * @returns {Record<string, Partial<ApplicationTab>>}
   * @protected
   */
  _getTabs(parts) {
    // If you have sub-tabs this is necessary to change
    const tabGroup = 'primary';
    // Default tab for first time it's rendered this session
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'tracks';
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'OUTSIDE_THE_WIRE.Item.Tabs.',
      };
      switch (partId) {
        case 'header':
          return tabs;
        default:
          tab.id = partId;
          tab.label += partId.charAt(0).toUpperCase() + partId.slice(1);
      }
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  prepareItems(context) {
    let tracks = {};
    if (game.user.isGM)
      tracks = this.item.system.tracks;
    else
      for (const trackId of Object.keys(this.item.system.tracks)) {
        const track = this.item.system.tracks[trackId];
        if (track.visibility == OUTSIDE_THE_WIRE.TRACK.VISIBILITY.hidden)
          continue;

        track.showOnlyName = track.visibility == OUTSIDE_THE_WIRE.TRACK.VISIBILITY.showOnlyName;
        tracks[trackId] = track;
      }

    context.tracks = tracks;
  }

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   */
  // async _onRender(context, options) {
  //   await super._onRender(context, options);
  //   new DragDrop.implementation({
  //     dragSelector: ".draggable",
  //     dropSelector: null,
  //     permissions: {
  //       dragstart: this._canDragStart.bind(this),
  //       drop: this._canDragDrop.bind(this)
  //     },
  //     callbacks: {
  //       dragstart: this._onDragStart.bind(this),
  //       dragover: this._onDragOver.bind(this),
  //       drop: this._onDrop.bind(this)
  //     }
  //   }).bind(this.element);
  //   // You may want to add other special handling here
  //   // Foundry comes with a large number of utility classes, e.g. SearchFilter
  //   // That you may want to implement yourself.
  // }

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   * @override
   */
  async _onRender(context, options) {
    await super._onRender(context, options);

    if (game.user.isGM && options.isFirstRender) {
      const togglePlayEditLabel = game.i18n.localize(`OUTSIDE_THE_WIRE.editMode.${this.item.system.editMode}`);
      const cssClass = this.item.system.editMode ? "pen-to-square" : "circle-play";
      const togglePlayEditId = `
        <button type="button" class="header-control fa-solid fa-${cssClass} icon" data-action="togglePlayEditMode" data-tooltip="${togglePlayEditLabel}" aria-label="${togglePlayEditLabel}"></button>
      `;
      this.window.close.insertAdjacentHTML("beforebegin", togglePlayEditId);
    }
  }

  /**************
   *
   *   ACTIONS
   *
   **************/

  static async _addTrack(event) {
    const id = foundry.utils.randomID();
    const track = {
      id,
      name: "New Track"
    };
    return this.item.update({ [`system.tracks.${id}`]: track });
  }

  static async _deleteTrack(event, target) {
    const dataset = target.dataset;
    if (await foundry.applications.api.DialogV2.confirm({
      content: game.i18n.localize("OUTSIDE_THE_WIRE.Item.Track.deleteConfirmation"),
      rejectClose: false,
      modal: true
    }))
      return this.item.update({ [`system.tracks.${dataset.trackId}`]: foundry.data.operators.ForcedDeletion.create() });
  }

  static async _updateValue(event, target) {
    if (!game.user.isGM)
      return;

    const dataset = target.dataset;
    return this.item.system.updateCurrentValue(dataset.trackId, dataset.targetValue);
  }

  static async _togglePlayEditMode(event, target) {
    const togglePlayEditLabel = game.i18n.localize(`OUTSIDE_THE_WIRE.editMode.${!this.item.system.editMode}`);
    $(target).toggleClass("fa-circle-play").toggleClass("fa-pen-to-square").attr("data-tooltip", togglePlayEditLabel);
    await this.item.update({ "system.editMode": !this.item.system.editMode });
  }

  /** Helper Functions */


  /**
   *
   * DragDrop
   *
   */

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
   * Callback actions which occur at the beginning of a drag start workflow.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragStart(event) {
    const li = event.currentTarget;
    if ('link' in event.target.dataset) return;

    let dragData = null;

    // Active Effect
    if (li.dataset.effectId) {
      const effect = this.item.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(event) {}

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event) {
    return;
    const data = TextEditor.getDragEventData(event);
    const item = this.item;
    const allowed = Hooks.call('dropItemSheetData', item, this, data);
    if (allowed === false) return;

    // Although you will find implmentations to all doc types here, it is important to keep
    // in mind that only Active Effects are "valid" for items.
    // Actors have items, but items do not have actors.
    // Items in items is not implemented on Foudry per default. If you need an implementation with that,
    // try to search how other systems do. Basically they will use the drag and drop, but they will store
    // the UUID of the item.
    // Folders can only contain Actors or Items. So, fall on the cases above.
    // We left them here so you can have an idea of how that would work, if you want to do some kind of
    // implementation for that.
    switch (data.type) {
      case 'ActiveEffect':
        return this._onDropActiveEffect(event, data);
      case 'Actor':
        return this._onDropActor(event, data);
      case 'Item':
        return this._onDropItem(event, data);
      case 'Folder':
        return this._onDropFolder(event, data);
      case 'Macro':
        return this._onDropMacro(event, data);
    }
  }
}
