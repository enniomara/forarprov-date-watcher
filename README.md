# Förarprov date watcher & notifier

This simple NodeJS application will check Förarprov's API for new driving test dates. It runs a check every x minutes(default is 5). If a new date is available it will send a notification to your PushBullet account.


## Getting started

* Install the required dependencies by running
```
npm install
```
* Fill the missing config options in `config.js`
  * `pushbulletToken` the token that is provided by PushBullet. Usually found in your [Account settings](https://www.pushbullet.com/#settings/account) page.
  * `socialSecurityNumber` your Swedish social security number.
  * `FpsExternalIdentity` this is your token/cookie that is used by the API. You need to retrieve this manually on your devtools from the API-call the website makes.
  * `intervalMinutes` Interval the application will query the API
* Start the application by running
```
npm start
```


**Note:** The application might crash sometimes/often, so running it via e.g. nodemon or forever is recommended.
