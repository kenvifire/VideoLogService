"use strict";

const admin = require("firebase-admin");
const {VIDEO_LOGS, VIDEOS, USAGE, BUCKET, SUCCESS,
  ERROR_VIDEO_FILE_NOT_EXIST, ERROR_USAGE_EXCEED} = require("../constants");
const functions = require("firebase-functions");
const _ = require("lodash");
const planService = require("./planService");

/**
 * Add a videolog record.
 * @param {string} uid uid for user.
 * @param {Object} videoLog log record.
 * @return {Promise<{status: string}>} void.
 */
async function addVideoLog(uid, videoLog) {
  await admin
      .firestore()
      .collection(VIDEO_LOGS)
      .doc(uid)
      .update({
        logs: [videoLog],
      });
  const size = await readLogSize(uid, videoLog.videoName);

  const usage = await getUsagePlan(uid);

  const quota = planService.plans[usage.plan].quota;
  if (quota >= 0 && size + usage.usage > quota) {
    await removeLogFile(uid, videoLog.videoName);

    throw new functions.https.HttpsError(
        "failed-precondition",
        ERROR_USAGE_EXCEED,
    );
  } else {
    await updateUsage(uid, size);
    return {
      "status": SUCCESS,
    };
  }
}

/**
 * Remove a videolog record.
 * @param {string} uid for user.
 * @param {string} recordId record to be removed.
 * @return {Promise<void>} void.
 */
async function removeVideoLog(uid, recordId) {
  const snapshot = await admin
      .firestore()
      .collection(VIDEO_LOGS)
      .doc(uid)
      .get();
  if (!snapshot.exists) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        ERROR_VIDEO_FILE_NOT_EXIST,
    );
  }
  const data = snapshot.data();
  const record = _.filter(data, {recordId: recordId});

  const size = await readLogSize(uid, record.fileName);
  await removeLogFile(uid, record.fileName);

  await updateUsage(uid, -size);
}

/**
 * Read log size.
 * @param {string} uid for user.
 * @param {string} fileName file to be deleted.
 * @return {Promise<number>} void.
 */
async function readLogSize(uid, fileName) {
  const file = admin
      .storage()
      .bucket(BUCKET)
      .file(VIDEOS + "/" + uid + "/" + fileName);
  const exists = await file.exists();
  if (exists) {
    const meta = await file.getMetadata();
    return parseInt(meta[0].size);
  } else {
    throw new functions.https.HttpsError(
        "unknown",
        `${file} for user ${uid} dose not exist`,
    );
  }
}

/**
 * Remove a video log file.
 * @param {string} uid , for user.
 * @param {string} fileName, file to be delete.
 * @return {Promise<void>}, void return.
 */
async function removeLogFile(uid, fileName) {
  const file = admin
      .storage()
      .bucket(BUCKET)
      .file(VIDEOS + "/" + uid + "/" + fileName);
  const exists = await file.exists();
  if (exists) {
    await file.delete();
  } else {
    throw new functions.https.HttpsError(
        "unknown",
        ERROR_VIDEO_FILE_NOT_EXIST,
    );
  }
}

/**
 * Get usage plan for a user.
 * @param {string} uid for user.
 * @return {Promise<DocumentData>} usage data.
 */
async function getUsagePlan(uid) {
  const usageRef = admin.firestore().collection(USAGE).doc(uid);
  const doc = await usageRef.get();
  if (!doc.exists) {
    throw new functions.https.HttpsError(
        "unknown",
        `usage plan does not exist for user ${uid}`,
    );
  } else {
    return doc.data();
  }
}

/**
 * Update usage plan.
 * @param {string} uid for user.
 * @param {number} usage for usage.
 * @return {Promise<void>} void.
 */
async function updateUsage(uid, usage) {
  const curr = getUsagePlan(uid);
  if (curr + usage < 0) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        `invalid usage for ${uid}`,
    );
  }

  await admin
      .firestore()
      .collection(USAGE)
      .doc(uid)
      .update({
        usage: admin.firestore.FieldValue.increment(usage),
      });
}

module.exports = {
  addVideoLog,
  removeVideoLog,
};
