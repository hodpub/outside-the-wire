import { OUTSIDE_THE_WIRE } from "../config/_outside-the-wire.mjs";

export default function registerHandlebarsHelpers() {
  Handlebars.registerHelper({
    bar,
    add,
    has,
    getRanks,
    createBar,
  });
}

export function bar(value, max) {
  const percentage = Math.min((value / max) * 100, 100);
  return new Handlebars.SafeString(`
      <div class="inner-bar" style="background: linear-gradient(to right, #ffe72a ${percentage}%, #fff ${percentage + 1}%)"></div>
  `);
}

export function add(value, increment) {
  return value + increment;
}

export function has(obj, property) {
  return obj.has(property);
}

export function getRanks(nationality, serviceBranch, initialRank) {
  let list = OUTSIDE_THE_WIRE.RANKS[nationality] ?? OUTSIDE_THE_WIRE.RANKS.default;
  list = list[serviceBranch] ?? list.default;

  const options = [];
  options.push("<optgroup label=\"Enlisted\">");
  for (let index = 0; index < list[false].length; index++) {
    const element = list[false][index];
    const selected = index == initialRank ? "selected" : "";
    options.push(`<option value="${index}" ${selected}>${element}</option>`);
  }
  options.push("</optgroup>");
  options.push("<optgroup label=\"Officer\">");
  for (let index = 0; index < list[true].length; index++) {
    const element = list[true][index];
    const value = 100 + index;
    const selected = value == initialRank ? "selected" : "";
    options.push(`<option value="${value}" ${selected}>${element}</option>`);
  }
  options.push("</optgroup>");
  const stringOptions = options.join("");
  return new Handlebars.SafeString(stringOptions);
}

export function createBar(track, isGM) {
  const options = [];
  for (let index = track.min; index <= track.max; index++) {
    let css = index <= track.current ? "filled" : "";
    const action = isGM ? `data-action="updateValue" data-track-id="${track.id}" data-target-value="${index}"` : "";
    options.push(`<div class="${css}" ${action}>${index}</div>`);
  }
  const stringOptions = options.join("");
  return new Handlebars.SafeString(stringOptions);
}