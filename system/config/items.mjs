import { createListAndChoices } from "../helpers/config.mjs";

export const ITEMS = {};

ITEMS.DEPLOYMENT_DETAIL_TYPE = {
  location: "location",
  awards: "awards",
  school: "school"
};

createListAndChoices(ITEMS, "DEPLOYMENT_DETAIL_TYPE", ITEMS.DEPLOYMENT_DETAIL_TYPE, "OUTSIDE_THE_WIRE.Item.Deployment.FIELDS");

ITEMS.DEPLOYMENT_PROMOTION = {
  noPromotion: 0,
  promotion: 1,
  officerPromotion: 2
};

createListAndChoices(ITEMS, "DEPLOYMENT_PROMOTION", ITEMS.DEPLOYMENT_PROMOTION, "OUTSIDE_THE_WIRE.Item.DeploymentDetail.FIELDS.rank");