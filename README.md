# YouPeriod.app

[![License](https://img.shields.io/badge/license-MIT-a1356a)](LICENSE.txt)

**You.** The privacy-first period-tracking app.

----
----

**IMPORTANT:** This app is still being developed. It's not ready for use yet, but will be soon. Please check back.

----
----

## Privacy First

We believe this kind of private and sensitive medical information belongs to *you*, and *you* alone. As such, **You.** (the app) puts *you* in control of all your information, and never collects or tracks anything about *you*, not even your name or email address. Since ***we don't have any of your data***, we obviously ***CANNOT*** sell it or hand it over to any governmental authority.

Everything *you* enter into **You.** (the app) is yours, and always and only yours. It stays on your device, protected and secure, and *you* decide what to do with that information.

This app is free to use, and will remain so forever.

Once installed, this web-app (PWA) runs entirely offline -- only locally on your device, with no need for any internet or to connect to any remote service -- and uses strong cryptography practices to keep your data secure and private on your device, ***ONLY***.

That means that even if the server were to be taken down, your local install of this app will remain functional on your device, with your data safe and secure, for as long as *you* decide.

## To Install This App

This web-app is an installable PWA (progressive web app), meaning you install it via your device's web browser.

This is important, because it means that even if device app stores (like Apple's App Store or Google's Google Play Store) refuse to allow this app, or governments force them to block it, as long as you have an open internet connection, you can always install this application free of any governmental control.

1. Visit https://YouPeriod.app in a browser on your device.

    - For iOS devices, Safari browser offers the best installable PWA experience, so that's strongly recommended.

    - For all other devices (Android, Windows, etc), Chrome browser offers the best installable PWA experience, so that's strongly recommended.

2. For iOS, click the "share" button in Safari's bottom toolbar, then scroll to find "Add to homescreen". Follow the prompts to install the app. Once installed, close the Safari tab and use the app from your homescreen / app-drawer.

3. For Android (using Chrome), click the "Install" button in the banner and follow the prompts. Once installed, close the Chrome tab and use the app from your homescreen / app-drawer.

4. For any other device (again, using Chrome), click the settings icon (three dots) near the top address bar, then select the menu option that says "Install YouPeriod".

## For Developers

All code for this app (both client and static-file-server) is open-source ([MIT License](LICENSE.txt)) and freely available for anyone to inspect, audit, etc.

If you'd like to run this app (including the static file server that applies proper security headers, etc), clone this repository then start the server from the project root:

```cmd
npm start
```

By default, the server will run on `localhost` at port `8034`, and thus the app will be available in your browser via `http://localhost:8034`.

## License

[![License](https://img.shields.io/badge/license-MIT-a1356a)](LICENSE.txt)

All code and documentation are (c) 2022 YouPeriod.app and released under the [MIT License](http://getify.mit-license.org/). A copy of the MIT License [is also included](LICENSE.txt).
