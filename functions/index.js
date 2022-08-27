"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");

const serviceAccount = require("./videolog-23d84-firebase-adminsdk-n79mr-acb6214e38.json");
const {addVideoLog, removeVideoLog} = require("./services/videologservice");
const {checkAuth, initUser} = require("./services/userService");
const {updatePlan} = require("./services/planService");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.initUser = functions.https.onCall(async (data, context) => {
  checkAuth(context);
  await initUser(context.auth.uid);
});

exports.addVideoLog = functions.https.onCall(async (data, context) => {
  checkAuth(context);
  const userId = context.auth.uid;
  await addVideoLog(userId, data);
});

exports.removeVideoLog = functions.https.onCall(async (data, context) => {
  checkAuth(context);
  const userId = context.auth.uid;
  await removeVideoLog(userId, data.recordId);
});


exports.updateUserPlan = functions.https.onCall(async (data, context) => {
  checkAuth(context);
  const userId = context.auth.uid;
  await updatePlan(userId, data.planName);
});
