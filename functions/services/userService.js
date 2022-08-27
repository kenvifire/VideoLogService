"use strict";

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const {USER_PREFERENCES} = require("../constants");
const {initPlan} = require("./planService");
const {initUserData} = require("./videologservice");

/**
 * Init user data
 * @param {string} uid
 */
async function initUser(uid) {
  // init plan
  await initPlan(uid);
  // init log records
  await initUserData(uid);
  // init preference
  await initPreference(uid);
}

/**
 * Check auth context
 * @param {CallableContext} context auth context
 */
function checkAuth(context) {
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated.",
    );
  }
}

/**
 * Init user preference.
 * @param {string} uid user id
 */
function initPreference(uid) {
  admin.firestore().collection(USER_PREFERENCES).doc(uid).set(
      {
        saveToCloud: false,
      });
}

module.exports = {
  initUser,
  checkAuth,
};
