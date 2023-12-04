

# Webpush destination SDK for IBM Cloud Event Notifications service Version 0.2.0
Webpush destination client library to interact with various [IBM Cloud Event Notifications Service](https://cloud.ibm.com/apidocs?category=event-notifications).

Disclaimer: this SDK is being released initially as a **pre-release** version.
Changes might occur which impact applications that use this SDK.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Using the SDK](#using-the-sdk)
- [Questions](#questions)
- [Issues](#issues)
- [Open source @ IBM](#open-source--ibm)
- [Contributing](#contributing)
- [License](#license)

<!-- tocstop -->

## Overview

The IBM Cloud Event Notifications Service Webpush destination SDK allows developers to register for Chrome and Firefox destiantions of Event Notifications service in IBM cloud.

Service Name | Artifact Coordinates
--- | ---
[Event Notifications Service](https://cloud.ibm.com/apidocs/event-notifications) | ENPush:0.2.0

## Prerequisites

[ibm-cloud-onboarding]: https://cloud.ibm.com/registration

* An [IBM Cloud][ibm-cloud-onboarding] account.
* An Event Notifications Instance
* An IAM API key to allow the SDK to access your account. Create one [here](https://cloud.ibm.com/iam/apikeys).

## Installation
The current version of this SDK is: 0.2.0

Downlaod the latest version from [Github](https://github.com/IBM/event-notifications-destination-webpush-sdk/releases/latest)


## Using the SDK

SDK Methods to consume

- [Installation](#installation)
	- [Include SDK in your project](#include-sdk-in-your-project)
- [Initialize SDK](#initialize-sdk)
- [Register for notifications](#register-for-notifications)
- [Unregistering from notifications](#unregistering-from-notifications)
- [Event Notifications destination tags subscriptions](#event-notifications-destination-tags-subscriptions)
	- [Subscribe to tags](#subscribe-to-tags)
	- [Retrieve subscribed tags](#retrieve-subscribed-tags)
	- [Unsubscribe from tags](#unsubscribe-from-tags)
- [Notification options](#notification-options)
	- [Adding custom DeviceId for registration](#adding-custom-deviceid-for-registration)
- [Notification Status reports](#notification-status-report)

## Installation

### Include SDK in your project

1. Add the `ENPushSDK.js`,`ENPushServiceWorker.js` and `manifest_Website.json` files to your project root folder.
2. Edit the manifest_Website.json file.
   ```js
   {
     "name": "YOUR_WEBSITE_NAME"
    }
   ```
3. Change the `manifest_Website.json` file name to `manifest.json`.

4. Include the manifest.json in <head> tag of your html file.

	```html
  	<link rel="manifest" href="manifest.json">
 	```

5. Include IBM Cloud Web push SDK to the script ,

	```html
	<script src="ENPushSDK.js" async></script>
	```

### Connect using private network connection (optional)

Set the SDK to connect to Event Notification service by using a private endpoint that is accessible only through the IBM Cloud private network.

```js
enPush.UsePrivateEndpoint(true)

```
This must be done before calling the initialize function on the SDK.
>**Note**: Currently private end point is not supported over Safari destination.

### Initialize SDK

Complete the following steps to enable Website to initialize the SDK.

```js
var enPush = new ENPush()

function callback(response) {
  alert(response.response)
}

var initParams = {
  "instanceGUID": "<instance_guid>",
  "apikey": "<instance_apikey>",
  "region": "<region>",
  "deviceId": "<YOUR_DEVICE_ID>",
  "chromeDestinationId": "<chrome_destination_id>",
  "chromeApplicationServerKey": "<Chrome_VapId_public_key>",
  "firefoxDestinationId": "<firefox_destination_id>",
  "firefoxApplicationServerKey": "<Firefox_VapId_public_key>",
  "safariDestinationId": "<IBM-Cloud-en-instance-safari-destination-id>",
  "websitePushIdSafari": "<safari-web-push-id>"
}

enPush.initialize(initParams, callback)

```

- region : Region of the Event Notifications Instance. eg; `us-south`,`eu-gb`, `au-syd`, `eu-de` and 'eu-es'
- deviceId: Optional deviceId for device registration.

## Register for notifications

Use the `register()` or `registerWithUserId()` API to register the device with IBM Cloud Event Notifications service. Choose either of the following options:

- Register without UserId:
	
	```js
	enPush.register(function(response) {
 	   alert(response.response)
 	})
	```

- Register with UserId. For `userId` based notification, the register method will accept one more parameter - `userId`.

	```js
	enPush.registerWithUserId("UserId",function(response) {
 		alert(response.response)
 	})
	```
`UserId` is the user identifier value with which you want to register devices in the push service instance.


### Unregistering from notifications

Use the following code snippets to un-register from Event Notifications.
```java
enPush.unRegisterDevice(function(response) {
 	alert(response.response)
 }
```
>**Note**: To unregister from the `UserId` based registration, you have to call the registration method. See the `Register without userId option` in [Register for notifications](#register-for-notifications).

## Event Notifications destination tags subscriptions

### Subscribe to tags

The `subscribe` API will subscribe the device for a given tag. After the device is subscribed to a particular tag, the device can receive notifications that are sent for that tag. 

Add the following code snippet to your web application to subscribe to a list of tags.

```js
enPush.subscribe(tagName, function(response) {
  alert(response.response)
})
```

### Retrieve subscribed tags

The `getSubscriptions` API will return the list of tags to which the device is subscribed. Use the following code snippets in the mobile application to get the subscription list.

```js
enPush.retrieveSubscriptions(function(response){
   alert(response.response);
})
```

### Unsubscribe from tags

The `unSubscribe` API will remove the device subscription from the list tags. Use the following code snippets to allow your devices to get unsubscribe from a tag.

```js
// unsubscibe from the given tag ,that to which the device is subscribed.
enPush.unSubscribe(tagName, function(response) {
	alert(response.response)
}
```

## Notification options

### Adding custom DeviceId for registration

To send `DeviceId` use the `setDeviceId` method of `ENPushNotificationOptions` class.

```js
	ENPushNotificationOptions options = new ENPushNotificationOptions();
	options.setDeviceid("YOUR_DEVICE_ID");
```
>**Note**: Remember to keep custom DeviceId `unique` for each device.

## Notification Status report

 To enable/disable the message status report, use the following method, 

 ```js
 enPush.enableMessageStatusReport(true) // send false for disabling the status.
 ```
>**Note**: By default status reporting is disabled. Status tracking feature is not supported for safari browser and it is available for Firefox and Chrome browsers.

## Questions

If you are having difficulties using this SDK or have a question about the IBM Cloud services,
please ask a question at
[Stack Overflow](http://stackoverflow.com/questions/ask?tags=ibm-cloud).

## Issues
If you encounter an issue with the project, you are welcome to submit a
[bug report](https://github.com/IBM/event-notifications-destination-webpush-sdk/issues).
Before that, please search for similar issues. It's possible that someone has already reported the problem.

## Open source @ IBM
Find more open source projects on the [IBM Github Page](http://ibm.github.io/)

## Contributing
See [CONTRIBUTING](CONTRIBUTING.md).

## License

The IBM Cloud Event Notifications Service Webpush destination SDK is released under the Apache 2.0 license.
The license's full text can be found in [LICENSE](LICENSE).
