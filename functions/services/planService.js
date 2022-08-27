const admin = require("firebase-admin");
const {USAGE, USER_PREFERENCES} = require("../constants");
const functions = require("firebase-functions");

/**
 * Class for usage plan.
 */
class Plan {
  // name: name of plan
  // quota
  // eslint-disable-next-line require-jsdoc
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

/**
 * update {string} user plan.
 * @param {string} uid user id.
 * @param planName plan name.
 * @return {Promise<FirebaseFirestore.WriteResult>}
 */
function updatePlan(uid, planName) {
  if (!plans[planName]) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        `invalid plan ${planName}`,
    );
  }
  return admin.firestore().collection(USAGE).doc(uid).update({
    Plan: planName,
  });
}

/**
 *
 * @param uid
 * @return {Promise<FirebaseFirestore.WriteResult>}
 */
function initPlan(uid) {
  return admin.firestore().collection(USAGE).doc(uid).set(
      {
        Plan: "FREE",
        Usage: 0,
      });
}


module.exports = {
  FREE: plans.FREE.name,
  PLAN_5G: plans.PLAN_5G.name,
  PLAN_10G: plans.PLAN_10G.name,
  PLAN_20G: plans.PLAN_20G.name,
  PLAN_50G: plans.PLAN_50G.name,
  plans,
  initPlan,
  updatePlan,
};
