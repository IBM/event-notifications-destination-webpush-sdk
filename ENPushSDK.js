/**
 * (C) Copyright IBM Corp. 2022.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 'use strict';


 var _instanceId;
 var _destinationId;
 var _apikey
 var _region;
 var _deviceId;
 var _userId;
 var isPushInitialized = false;
 var isDebugEnabled = false; /* Enable for debugging*/
 var _isUserIdEnabled = false;
 var reWriteDomain;
 var ENPushResponse = {};
 var _platform;
 var _pushVaribales;
 var _pushBaseUrl;
 var _pushVapID;
 var _overrideServerHost;
 var _serviceWorker = "";
 var _websitePushIDSafari;
 var _usePrivate = false;
 
 /**
  * Push SDK class for handling the Web device requests
  * @module ENPush
  */
 
 
 function ENPush() {
 
     this.REGION_US_SOUTH = "us-south";
     this.REGION_UK = "eu-gb";
     this.REGION_SYDNEY = "au-syd";
     this.REGION_GERMANY = "eu-de";
     this.REGION_MADRID = "eu-es";
     this.REGION_BNPP = "eu-fr2";
 
 
    /**
        * To specify the end point either private/public
        *
        * @param {boolean} usePrivate - boolean value to specify private/public 
        * @method module:ENPush#usePrivateEndPoint
        */
     this.usePrivateEndPoint = function (usePrivate) {
        if(usePrivate){
                _usePrivate=true;
        }else{
            _usePrivate=false;
        }
    }

     /**
     * Initialize the Event Notifications Web Push SDK
     * @method module:ENPush#initialize
     * @param {string} instanceGUID - The Event Notifications service instance GUID value
     * @param {string} apikey - The Event Notifications service instance apikey value
     * @param {string} region - The region of Event Notifications service you hosted. Eg: us-south, eu-gb, au-syd, eu-de or eu-es
     * @param {string} chromeDestinationId - The Event Notifications service chrome destination Id value
     * @param {string} chromeApplicationServerKey - The Event Notifications service chrome destination VAPID public key value
     * @param {string} firefoxDestinationId - The Event Notifications service firefox destination Id value
     * @param {string} firefoxApplicationServerKey - The Event Notifications service firefox destination VAPID public key value
     * @param {string} safariDestinationId - The Event Notifications service Safari destination Id value
     * @param {string} websitePushIdSafari - The Event Notifications service chrome destination Id value
     * @param {string} deviceId - Optional parameter for deviceId.
     * @param {json} pushVaribales - Optional parameter for template based notificaitons.
     * @param {Object} callback - A callback function for initialization reponse handling.
     * @param {string} serviceWorker - Your service worker file name.
     */
     this.initialize = function (params, callback) {
 
         _instanceId = params.instanceGUID ? params.instanceGUID : "";
         _apikey = params.apikey ? params.apikey : "";
         _region = params.region ? params.region : "";
         _deviceId = params.deviceId ? params.deviceId : "";
         _serviceWorker = params.serviceWorker ? params.serviceWorker : ""
         _pushVaribales = params.pushVaribales ? params.pushVaribales : "";
         _overrideServerHost = params.overrideServerHost ? params.overrideServerHost : "";
 
         if (getBrowser() === SAFARI_BROWSER) {
             _destinationId = params.safariDestinationId ? params.safariDestinationId : "";
             _pushVapID = "not required for safari";
             _websitePushIDSafari = params.websitePushIdSafari ? params.websitePushIdSafari : "";
         } else if (getBrowser() != CHROME_BROWSER) {
             _destinationId = params.firefoxDestinationId ? params.firefoxDestinationId : "";
             _pushVapID = params.firefoxApplicationServerKey ? params.firefoxApplicationServerKey : ""
         } else {
             _destinationId = params.chromeDestinationId ? params.chromeDestinationId : "";
             _pushVapID = params.chromeApplicationServerKey ? params.chromeApplicationServerKey : ""
         }
 
         if (validateInput(_instanceId) &&
             validateInput(_apikey) &&
             validateInput(_destinationId) &&
             validateInput(_pushVapID)) {
 
             getBaseUrl(_region);
             if (!validateInput(_deviceId)) {
                 _deviceId = generateUUID()
             }
 
             localStorage.setItem("deviceId", _deviceId);
             localStorage.setItem("destinationId", _destinationId);
             localStorage.setItem("enapikey", _apikey);
             localStorage.setItem("instanceId", _instanceId);
 
             if (validateInput(_pushVaribales)) {
                 localStorage.setItem("pushVaribales", _pushVaribales);
             }
 
             checkNotificationSupport().then(() => {
                 isPushInitialized = true;
                 callback(getENPushResponse("Successfully initialized Push", 200, ""));
             }).catch(error => {
                 isPushInitialized = false;
                 callback(error);
             });
 
             if (getBrowser() != SAFARI_BROWSER) {
                 sendMessage(_pushVaribales);
             }
 
         } else {
             printLog("Please provide a valid config values");
             setPushResponse("Please provide a valid  appGUID or/and appRegion", 404, "Error");
             callback(PushResponse);
         }
 
         printLog("Exit - ENPush initialize");
 
     }
 
     /**
 * Registers the device on to the ENPush Notification Server
 * @param {Object} callback - A callback function
 * @method module:ENPush#register 
 */
     this.register = function (callbackM) {
         _userId = "";
         registerPush(_userId, callbackM);
     };
 
     /**
 * Enable/Disbale push notifications status report
 * @param {boolean} enable
 * @method module:ENPush#enableMessageStatusReport 
 */
     this.enableMessageStatusReport = function (enable) {
         localStorage.setItem("enableMessageStatus", enable);
     };
 
     /**
 * Registers the device on to the ENPush Notification Server
 *
 * @param {string} userId: the User ID value.
 * @param {Object} callback - A callback function
 * @method module:ENPush#registerWithUserId
 */
     this.registerWithUserId = function (userId, callbackM) {
         registerPush(userId, callbackM);
     };
 
     /**
 * Unregisters the device from the ENPush Notification Server
 * @param {Object} callback - A callback function
 * @method module:ENPush#unRegisterDevice
 */
     this.unRegisterDevice = function (callbackM) {
         printLog("Enter - unRegisterDevice");
 
         if (getBrowser() === SAFARI_BROWSER) {
             callback(unRegisterDevice(callbackM));
         } else {
             navigator.serviceWorker.ready.then(function (reg) {
 
                 reg.pushManager.getSubscription().then(
                     function (subscription) {
                         if (!subscription) {
                             // We aren’t subscribed to push, so set UI
                             // to allow the user to enable push
                             setPushResponse("The device is not enabled for push notifications", 0, "Error");
                             callbackM(ENPushResponse);
                             printLog("Exit - unRegisterDevice");
                             return;
                         }
 
                         setTimeout(function () {
                             // We have a subcription, so call unsubscribe on it
                             subscription.unsubscribe().then(function (successful) {
                                 printLog('Successfully unRegistered from GCM push notification');
                                 callback(unRegisterDevice(callbackM));
                             }).catch(function (e) {
                                 // We failed to unsubscribe, this can lead to
                                 // an unusual state, so may be best to remove
                                 // the subscription id from your data store and
                                 // inform the user that you disabled push
                                 printLog('Unsubscription error: ', e);
                                 callback("Error in Unregistration");
                                 setPushResponse("Insufficient Scope. Error in Unregistration", 401, "Error");
                                 callbackM(ENPushResponse);
                             })
                         }, 3000);
                     }).catch(function (e) {
                         printLog('Error thrown while unsubscribing from push messaging :', e);
                         callback("Error in Unregistration");
                         var error = "Error thrown while unsubscribing from push messaging :" + e;
                         setPushResponse(error, 401, "Error");
                         callbackM(ENPushResponse);
                     });
             });
         }
 
         printLog("Exit - unRegisterDevice");
     };
 
 
     /**
    * Subscribes to a particular backend mobile application Tag(s)
    *
    * @param {string} tagName - The Tag Name to subscribe to. Eg; ["tag1","tag2"]
    * @param {Object} callback - A callback function
    * @method module:ENPush#subscribe
    */
     this.subscribe = function (tagName, callbackM) {
 
         printLog("Enter - Subscribing tags");
         if (!isPushInitialized) {
             setPushResponse("Initialize before using this function", 0, "Not initialized");
             callbackM(ENPushResponse);
             printLog("Exit - Subscribing tags");
             return;
         }
         callback(subscribeTags(tagName, callbackM));
         printLog("Exit - Subscribing tags");
     };
 
     /**
     * Unsubscribes from an backend mobile application Tag(s)
     *
     * @param {string} tagName - The Tag name to unsubscribe from. Eg: ["tag1","tag2"]
     * @param {Object} callback - A callback function
     * @method module:ENPush#unSubscribe
     */
     this.unSubscribe = function (tagName, callbackM) {
         printLog("Enter - UnSubscribing tags");
         if (!isPushInitialized) {
             setPushResponse("Initialize before using this function", 0, "Not initialized");
             callbackM(ENPushResponse);
             printLog("Exit - UnSubscribing tags");
             return;
         }
 
         callback(unSubscribeTags(tagName, callbackM));
         printLog("Exit - UnSubscribing tags");
     };
 
 
     /**
  * Gets the Tags that are subscribed by the device
  * @param {Object} callback - A callback function
  * @method module:ENPush#retrieveSubscriptions
  */
     this.retrieveSubscriptions = function (callbackM) {
         printLog("Enter - retrieveSubscriptions");
         callback(retrieveTagsSubscriptions(callbackM));
         printLog("Exit - retrieveSubscriptions");
     };
 
 
     var setPushResponse = function (response, statusCode, error) {
         ENPushResponse.response = response;
         ENPushResponse.error = error;
         ENPushResponse.statusCode = statusCode;
     }
 
     this.pushResponse = function () {
         return ENPushResponse;
     };
 
     /*
      Enable debug mode to print the logs on the browser console
      */
     this.enableDebug = function () {
         isDebugEnabled = true;
     }
 
     /*
     Disable debug mode
     */
     this.disableDebug = function () {
         isDebugEnabled = false;
     }
 
     /*
     @Deprecated Use enableDebug or disableDebug
     */
     this.isDebugEnable = function (value) {
         if (typeof (value) === "boolean") {
             isDebugEnabled = value;
         }
     };
 
     /*
     Internal functions for the SDK
     */
     const FIREFOX_BROWSER = 'Firefox';
     const CHROME_BROWSER = 'Chrome';
     const SAFARI_BROWSER = 'Safari';
     const SERVICE_WORKER = 'ENPushServiceWorker.js';
     const PUSH_API_ENDPOINT = ".event-notifications.cloud.ibm.com";
 
     function getBrowser() {
         let userAgentOfBrowser = navigator.userAgent.toLowerCase();
         if ((userAgentOfBrowser.indexOf('safari') >= 0) && (userAgentOfBrowser.indexOf('chrome') == -1)) {
             return SAFARI_BROWSER;
         } else if (userAgentOfBrowser.indexOf("firefox") != -1) {
             return FIREFOX_BROWSER;
         } else {
             return CHROME_BROWSER;
         }
     }
 
     function registerPush(userId, callbackM) {
         if (validateInput(userId)) {
             printLog("userId based registration with userId " + userId);
             _isUserIdEnabled = true;
             _userId = userId;
         }
 
         if (getBrowser() === SAFARI_BROWSER) {
             let resultSafariPermission = window.safari.pushNotification.permission(_websitePushIDSafari);
             if (resultSafariPermission.permission === "default") {
                 //User never asked before for permission
                 let baseUrl = _pushBaseUrl + "/event-notifications/v1/instances/" + _instanceId + "/destinations/" + _destinationId + "/safariWebConf";
                 printLog("Request user for permission to receive notification for base URL " + baseUrl + " and websitepushID " + _websitePushIDSafari);
                 window.safari.pushNotification.requestPermission(baseUrl,
                     _websitePushIDSafari, {
                     "deviceId": localStorage.getItem("deviceId"),
                     "userId": userId
                 },
                     function (resultRequestPermission) {
                         if (resultRequestPermission.permission === "granted") {
                             printLog("The user has granted the permission to receive notifications");
                             registerUsingToken(resultRequestPermission.deviceToken, callbackM);
                         }
                     });
 
             } else if (resultSafariPermission.permission === "denied") {
                 // The user denied the notification permission which
                 // means we failed to subscribe and the user will need
                 // to manually change the notification permission to
                 // subscribe to push messages
                 printLog('Permission for Notifications was denied');
                 setPushResponse("The user denied permission for Safari Push Notifications.", 401, "Error");
                 callback("Error in registration");
                 callbackM(BMSPushResponse);
             } else {
                 //Already granted the permission
                 registerUsingToken(resultSafariPermission.deviceToken, callbackM);
             }
         } else {
             var subscribeOptions = { userVisibleOnly: true };
 
             if (validateInput(_pushVapID)) {
                 const convertedVapidKey = urlBase64ToUint8Array(_pushVapID);
                 subscribeOptions.applicationServerKey = convertedVapidKey;
             }
             navigator.serviceWorker.ready.then(function (reg) {
                 reg.pushManager.getSubscription().then(
                     function (subscription) {
                         if (subscription) {
                             registerUsingToken(subscription, callbackM);
                         } else {
                             reg.pushManager.subscribe(subscribeOptions).then(function (subscription) {
                                 registerUsingToken(subscription, callbackM);
                             }).catch(function (error) {
                                 if (Notification.permission === 'denied') {
                                     // The user denied the notification permission which
                                     // means we failed to subscribe and the user will need
                                     // to manually change the notification permission to
                                     // subscribe to push messages
                                     printLog('Permission for Notifications was denied');
                                     setPushResponse("Notifications aren\'t supported on service workers.", 401, "Error");
                                 } else {
                                     // A problem occurred with the subscription, this can
                                     // often be down to an issue or lack of the gcm_sender_id
                                     // and / or gcm_user_visible_only
                                     printLog('Unable to subscribe to push.', error);
                                     setPushResponse("Notifications aren\'t supported on service workers.", 401, "Error");
                                 }
                                 callback("Error in registration");
                                 callbackM(ENPushResponse);
                             });
                         }
                     }).catch(function (e) {
                         printLog('Error thrown while subscribing from ' +
                             'push messaging.', e);
                         setPushResponse(e, 401, "Error");
                         callbackM(ENPushResponse)
                     });
             });
         }
 
 
     }
 
     function update() {
 
         function callback(response) {
             printLog("updation is done :", response);
         }
         registerPush(_userId, callback);
     }
 
     function getENPushResponse(response, statusCode, error) {
         return {
             'response': response,
             'error': error,
             'statusCode': statusCode
         };
     }
 
     function urlBase64ToUint8Array(base64String) {
         const padding = '='.repeat((4 - base64String.length % 4) % 4);
         const base64 = (base64String + padding)
             .replace(/-/g, '+')
             .replace(/_/g, '/');
 
         const rawData = window.atob(base64);
         const outputArray = new Uint8Array(rawData.length);
 
         for (let i = 0; i < rawData.length; ++i) {
             outputArray[i] = rawData.charCodeAt(i);
         }
         return outputArray;
     }
 
 
     function sendMessage(message) {
         return new Promise(function (resolve, reject) {
             var messageChannel = new MessageChannel();
             messageChannel.port1.onmessage = function (event) {
                 if (event.data.error) {
                     reject(event.data.error);
                 } else {
                     resolve(event.data);
                 }
             };
             navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
         });
     }
 
     function checkNotificationSupport() {
 
         return new Promise((resolve, reject) => {
             printLog("Started checking the notification compatibility");
             if (navigator.serviceWorker) {
                 navigator.serviceWorker.addEventListener('message', function (event) {
                     console.log("Client 1 Received Message: " + event.data);
                     let eventData = event.data;
                     printLog("The response from the service worker is " + eventData);
                     let command = eventData.substr(0, eventData.indexOf(':'));
                     let msg = eventData.substr(eventData.indexOf(':') + 1);
                     let statusStr = '';
                     let nid = '';
                     if (command === 'msgEventOpen') {
                         statusStr = 'OPEN';
                         let jsonPayload = JSON.parse(msg);
                         nid = jsonPayload.en_nid;
                     }
                     else if (command === 'msgEventSeen') {
                         statusStr = 'SEEN';
                         let jsonMsg = JSON.parse(msg);
                         nid = jsonMsg.en_nid;
                     }
 
                     if (command === 'msgEventOpen' || command === 'msgEventSeen') {
 
                         _platform = "";
                         if (getBrowser() === FIREFOX_BROWSER) {
                             _platform = "WEB_FIREFOX";
                         } else if (getBrowser() === CHROME_BROWSER) {
                             _platform = "WEB_CHROME";
                         }
 
                         let statusObj = {
                             'notification_id': nid,
                             'status': statusStr,
                             'platform': _platform,
                         };
                         var deviceId = localStorage.getItem("deviceId");
                         var destinationId = localStorage.getItem("destinationId");
                         var enableStatus =  localStorage.getItem("enableMessageStatus");
                         if (enableStatus == null || !enableStatus) {
                             return
                         }
 
                         post("/destinations/" + destinationId + "/devices/" + deviceId + "/delivery", function (res) {}, statusObj);
                     }
                     else {
                         update();
                     }
                 });
 
 
                 if (!validateInput(_serviceWorker)) {
                     _serviceWorker = SERVICE_WORKER
                 }
                 navigator.serviceWorker.register(_serviceWorker).then(function (reg) {
 
                     if (reg.installing) {
                         printLog('Service worker installing');
                     } else if (reg.waiting) {
                         printLog('Service worker installed');
                     } else if (reg.active) {
                         printLog('Service worker active');
                     }
                     if (getBrowser() === SAFARI_BROWSER) {
                         resolve();
                     }
 
                     if (!(reg.showNotification)) {
                         printLog('Notifications aren\'t supported on service workers.');
                         reject(getENPushResponse("Notifications aren\'t supported on service workers.", 401, "Error"));
                     }
 
                     // Check the current Notification permission.
                     // If its denied, it's a permanent block until the
                     // user changes the permission
                     if (Notification.permission === 'denied') {
                         printLog('The user has blocked notifications.');
                         reject(getENPushResponse("The user has blocked notifications", 401, "Error"));
                     }
 
                     // Check if push messaging is supported
                     if (!('PushManager' in window)) {
                         printLog('Push messaging isn\'t supported.');
                         reject(getENPushResponse("Push messaging isn\'t supported.", 401, "Error"));
                     }
                     resolve();
                 });
             } else if (getBrowser() === SAFARI_BROWSER) {
                 resolve();
             }
         });
     }
 
     function callback(response) {
         printLog("Response from IBM Event Notifications Service");
         printLog(response);
     }
 
 
     function registerUsingToken(subscription, callbackM) {
 
 
         // Update status to subscribe current user on server, and to let
         // other users know this user has subscribed
         printLog('Subscription data is : ', JSON.stringify(subscription));
         // var subscriptionStr = JSON.stringify(subscription).replace(/"/g, "\\\"");
 
         _platform = "";
         var token;
 
         _deviceId = localStorage.getItem("deviceId");
         localStorage.setItem("token", subscription);
 
         if (getBrowser() === SAFARI_BROWSER) {
             _platform = "WEB_SAFARI";
             token = subscription; // This is a string value;
             printLog('The device token from safari is ' + token);
         } else {
             var rawKey = subscription.getKey ? subscription.getKey('p256dh') : '';
             var key = rawKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) : '';
             var rawAuthSecret = subscription.getKey ? subscription.getKey('auth') : '';
             var authSecret = rawAuthSecret ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuthSecret))) : '';
 
             if (!validateInput(subscription.endpoint) || !validateInput(key) || !validateInput(authSecret)) {
                 printLog("Error while getting token values");
                 callbackM(getENPushResponse("Error while getting token values", 500, "Error"));
                 return;
             }
             var tokenValue = {
                 "endpoint": subscription.endpoint,
                 "userPublicKey": key,
                 "userAuth": authSecret,
             };
             token = JSON.stringify(tokenValue);
         }
 
         if (getBrowser() === FIREFOX_BROWSER) {
             _platform = "WEB_FIREFOX";
         } else if (getBrowser() === CHROME_BROWSER) {
             _platform = "WEB_CHROME";
         }
         if (_isUserIdEnabled == true) {
             registerDevice({
                 "device_id": _deviceId,
                 "token": token,
                 "platform": _platform,
                 "user_id": _userId
             }, callbackM);
         } else {
             registerDevice({
                 "device_id": _deviceId,
                 "token": token,
                 "platform": _platform
             }, callbackM);
         }
     }
 
     function getDevice(deviceId) {
         printLog('Request for get device for the deviceId :' + deviceId);
         return new Promise(function (resolve, reject) {
             get("/destinations/" + _destinationId + "/devices/" + deviceId, function (res) {
                 printLog('previous Device Registration Result :', res);
                 if (res.status == 200) {
                     resolve(JSON.parse(res.responseText));
                 } else {
                     reject(res);
                 }
             });
 
         });
     }
 
     function updateDevice(device, put) {
         return new Promise((resolve, reject) => {
             put("/destinations/" + _destinationId + "/devices/" + device.device_id, function (res) {
                 if (res.status == 200 || res.status == 201) {
                     resolve(JSON.parse(res.responseText));
                 } else {
                     reject(res);
                 }
             }, device);
         });
     }
 
     function registerNewDevice(device, post) {
         return new Promise((resolve, reject) => {
             post("/destinations/" + _destinationId + "/devices", function (res) {
                 if (res.status == 201) {
                     resolve(JSON.parse(res.responseText));
                 } else {
                     reject(res);
                 }
             }, device);
         });
     }
 
     /* Register Device with/ without userId*/
 
     function registerDevice(deviceJSON, callbackM) {
 
         var device = deviceJSON;
 
         printLog("registerDevice: Checking the previous registration :", device);
         _userId = device.userId;
 
         getDevice(device.device_id, get).then(existingDevice => {
             if (existingDevice.token != device.token || existingDevice.device_id != device.device_id || (device.hasOwnProperty('user_id') && (existingDevice.user_id != device.user_id))) {
                 updateDevice(device, put).then((updatedDevice) => {
                     printLog("Successfully updated device");
                     callbackM(getENPushResponse(updatedDevice, 200, ""));
                 }).catch((res) => {
                     printLog("Error in udpating device and the response is " + res);
                     callbackM(getENPushResponse(res, status, "Error"));
                 });
             } else {
                 printLog("Device is already registered and device registration parameters not changed.");
                 callbackM(getENPushResponse(JSON.stringify(existingDevice), 201, ""));
             }
         }, errorObj => {
             if (errorObj.status == 404) {
                 printLog('Starting New Device Registration');
                 registerNewDevice(device, post).then((updatedDevice) => {
                     printLog("Successfully registered device");
                     callbackM(getENPushResponse(updatedDevice, 201, ""));
                 }).catch((res) => {
                     printLog("Error in registering device and the response is " + res);
                     callbackM(getENPushResponse(res, status, "Error"));
                 });
             } else if ((errorObj.status == 406) || (errorObj.status == 500)) {
                 printLog("Error while verifying previous device registration and the response is ,", errorObj);
                 callbackM(getENPushResponse(errorObj, status, "Error"));
             } else if (errorObj.status == 0) {
                 //OPTIONS failed... Possible incorrect appId
                 printLog("Error while verifying previous device registration and the response is ,", errorObj);
                 callbackM(getENPushResponse(errorObj, status, "Error"));
             }
         });
     }
 
     function unRegisterDevice(callbackM) {
         printLog("Entering the unregister device");
         var devId = localStorage.getItem("deviceId");
         deletes("/destinations/" + _destinationId + "/devices/" + devId, function (response) {
 
             var status = response.status;
             if (status == 204) {
                 printLog("Successfully unregistered the device");
                 setPushResponse(response.responseText, 204, "");
                 localStorage.setItem("deviceId", "");
                 callbackM(ENPushResponse);
                 return response;
             } else {
                 printLog("Error in  unregistering the device");
                 setPushResponse(response.responseText, status, "Error");
                 callbackM(ENPushResponse);
                 return response;
             }
         }, null);
     }
 
     function subscribeTags(tagName, callbackM) {
         printLog("Entering the subscribe tags");
         var devId = localStorage.getItem("deviceId");
         var tags = {
             "device_id": devId,
             "tag_name": tagName
         };
         post("/destinations/" + _destinationId + "/tag_subscriptions", function (res) {
             var status = res.status;
             printLog('Tag Subscription Result :', res);
             if (status >= 200 && status <= 300) {
                 printLog("Successfully subscribed to tags -");
                 printLog("The response is ,", res);
                 setPushResponse(res.responseText, status, "");
                 callbackM(ENPushResponse)
             } else {
                 printLog("Error while subscribing to tags :");
                 printLog("The response is ,", res);
                 setPushResponse(res.responseText, status, "Error while subscribing to tags :");
                 callbackM(ENPushResponse)
             }
             return res;
         }, tags, null);
     }
 
     function unSubscribeTags(tagName, callbackM) {
         printLog("Entering the Un-subscribe tags");
         var devId = localStorage.getItem("deviceId");
 
         // add delte TODO
         deletes("/destinations/" + _destinationId + "/tag_subscriptions?device_id=" + devId + "&tag_name=" + tagName, function (res) {
             var status = res.status;
             printLog('Tag un-subscription Result :', res);
             if (status >= 200 && status <= 300) {
                 printLog("Successfully Un-subscribed to tags -");
                 printLog("The response is ,", res);
                 setPushResponse(res.responseText, status, "");
                 callbackM(ENPushResponse)
             } else {
                 printLog("Error while Un-subscribing to tags :");
                 printLog("The response is ,", res);
                 setPushResponse(res.responseText, status, "Error while Un-subscribing to tags :");
                 callbackM(ENPushResponse)
             }
             return res;
         }, null, null);
     }
 
     function retrieveTagsSubscriptions(callbackM) {
         printLog("Entering the Retrieve subscriptions of tags");
         var devId = localStorage.getItem("deviceId");
 
         get("/destinations/" + _destinationId + "/tag_subscriptions?device_id=" + devId, function (res) {
             var status = res.status;
             printLog('Retrieve subscription Result :', res);
             if (status >= 200 && status <= 300) {
                 printLog("Successfully retrieved subscribed tags");
                 printLog("The response is ,", res);
                 setPushResponse(res.responseText, status, "");
                 callbackM(ENPushResponse)
             } else {
                 printLog("Error while retrieve subscribed tags :");
                 printLog("The response is ,", res);
                 setPushResponse(res.responseText, status, "Error while retrieve subscribed tags :");
                 callbackM(ENPushResponse)
             }
             return res;
         }, null);
     }
 
     /*
   API calls start here
   */
     function get(action, callback, data, headers) {
         return callPushRest('GET', callback, action, data, headers);
     }
 
     function post(action, callback, data, headers) {
         return callPushRest('POST', callback, action, data, headers);
     }
 
     function put(action, callback, data, headers) {
         return callPushRest('PUT', callback, action, data, headers);
     }
 
     function deletes(action, callback, data, headers) {
         return callPushRest('DELETE', callback, action, data, headers);
     }
 
     function callPushRest(method, callback, action, data, headers) {
 
         var pushBaseUrl = localStorage.getItem("pushBaseUrl");
         var instanceId = localStorage.getItem("instanceId");
 
         var url = pushBaseUrl + '/event-notifications/v1/instances/' + instanceId;
         var xmlHttp = new XMLHttpRequest();
         xmlHttp.onreadystatechange = function () {
             if (xmlHttp.readyState == 4) {
                 callback(xmlHttp);
             }
         }
         xmlHttp.open(method, url + action, true); // true for asynchronous
         xmlHttp.setRequestHeader('Content-Type', 'application/json; charset = UTF-8');
         xmlHttp.setRequestHeader('Accept-Language', 'en-US')
         var apikey = localStorage.getItem("enapikey");
         xmlHttp.setRequestHeader('en-api-key', apikey);
         xmlHttp.send(JSON.stringify(data));
 
     }

     function getBaseUrl(appReg) {
         if (_overrideServerHost) {
             _pushBaseUrl = _overrideServerHost;
         } else {
            if(_usePrivate){
                _pushBaseUrl = "https://private." + appReg + PUSH_API_ENDPOINT;
            }else{
                _pushBaseUrl = "https://" + appReg + PUSH_API_ENDPOINT;
            }
         }
         localStorage.setItem("pushBaseUrl", _pushBaseUrl);
     }
 
     String.prototype.hashCode = function () {
         var hash = 0,
             i, chr, len;
         if (this.length === 0) return hash;
         for (i = 0, len = this.length; i < len; i++) {
             chr = this.charCodeAt(i);
             hash = ((hash << 5) - hash) + chr;
             hash |= 0; // Convert to 32bit integer
         }
         return hash;
     };
 
     function generateUUID(token) {
 
         var devId = localStorage.getItem("deviceId");
 
         if (devId != null && devId.length > 0) {
             _deviceId = devId;
             return _deviceId;
         }
         var dateTime = new Date().getTime();
         if (window.performance && typeof window.performance.now === "function") {
             dateTime += performance.now(); //use high-precision timer if available
         }
 
         var hostname = window.location.hostname;
         var arrayData = [];
         arrayData.push(String(dateTime).hashCode());
         arrayData.push(String(token).hashCode());
         arrayData.push(String(hostname).hashCode());
         arrayData.push(String(_platform).hashCode());
 
         let uuid = crypto.randomUUID();
         localStorage.setItem("deviceId", uuid);
         _deviceId = uuid;
         return _deviceId;
     }
 
 
     function validateInput(stringValue) {
         return (stringValue === undefined) || (stringValue == null) || (stringValue.length <= 0) || (stringValue == '') ? false : true;
     }
 
     function printLog(Result, data) {
         if (isDebugEnabled == true) {
             var resultString = Result ? Result : " ";
             var additionalData = data ? data : "";
             console.log("Response : ", resultString, " ", additionalData);
         }
     }
 
     function storeToken(token) {
         const itemStr = localStorage.getItem("en_push_token")
         const now = new Date()
         const item = {
             value: token,
             expiry: now.getTime() + (1 * 60 * 60 * 1000), // added one hour
         }
         localStorage.setItem(itemStr, JSON.stringify(item))
     }
 
     function getExistingToken() {
         const itemStr = localStorage.getItem("en_push_token")
         if (!itemStr) {
             return null
         }
         const item = JSON.parse(itemStr)
         const now = new Date()
         if (now.getTime() > item.expiry) {
             localStorage.removeItem(itemStr)
             return null
         }
         return item.value
     }

 }
