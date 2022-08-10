const admin = require("firebase-admin");
const {USAGE} = require("../constants");

/**
 * Class for usage plan.
 */
class Plan {
  // name: name of plan
  // quota
  constructor(name, quota) {
    this.name = name;
    this.quota = quota;
  }
}

const plans = {
  FREE: new Plan("Free", 0),
  PLAN_5G: new Plan("PLAN_5G", 5 * 1024 * 1024),
  PLAN_10G: new Plan("PLAN_10G", 10 * 1024 * 1024),
  PLAN_20G: new Plan("PLAN_20G", 20 * 1024 * 1024),
  PLAN_50G: new Plan("PLAN_50G", 50 * 1024 * 1024),
};

module.exports.updatePlan = function(uid, planName) {
  return admin.firestore().collection(USAGE).doc(uid).update({
    Plan: planName,
  });
};

module.exports.FREE = plans.FREE.name;
module.exports.PLAN_5G = plans.PLAN_5G.name;
module.exports.PLAN_10G = plans.PLAN_10G.name;
module.exports.PLAN_20G = plans.PLAN_20G.name;
module.exports.PLAN_50G = plans.PLAN_50G.name;
module.exports.plans = plans;
