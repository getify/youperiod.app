# YouPeriod.app

[![License](https://img.shields.io/badge/license-MIT-a1356a)](LICENSE.txt)

**You.** The privacy-first period-tracking app.

---

---

**IMPORTANT:** This app is still being developed. It's not ready for use yet, but will be soon. Please check back.

---

---

## Privacy First

We believe this kind of private and sensitive medical information belongs to _you_, and _you_ alone. As such, **You.** (the app) puts _you_ in control of all your information, and never collects or tracks anything about _you_, not even your name or email address. Since **_we don't have any of your data_**, we obviously **_CANNOT_** sell it or hand it over to any governmental authority.

Everything _you_ enter into **You.** (the app) is yours, and always and only yours. It stays on your device, protected and secure, and _you_ decide what to do with that information.

This app is free to use, and will remain so forever.

Once installed, this web-app (PWA) runs entirely offline -- only locally on your device, with no need for any internet or to connect to any remote service -- and uses strong cryptography practices to keep your data secure and private on your device, **_ONLY_**.

That means that even if the server were to be taken down, your local install of this app will remain functional on your device, with your data safe and secure, for as long as _you_ decide.

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

## Documentation

### First login - local profile creation

This application is written with HTML + CSS + JS and under the hood use NodeJs http module `require("http")` to create a server `http.createServer(handleRequest)` on port `8034`<br>
When the end user hit the homepage there are some information to fill

-   profile name/description - _at least 2 letters long_
-   secret phrase (with confirmation check) - _at least 12 letters long_

with these info the application will create an unique local profile into IndexedDB database called `keyval-store`.<br>

Inside `keyval-store` the application store key/value objects.

-   **profile:** a list of saved profiles (you can have more then one)<br><br>e.g.<br>
    ```json
    {
        "test": "e6c1005d-4efd-4450-ba96-ffbdbd1d6efa",
        "test2": "7ea69deb-af83-413d-84c6-3598cb7a6c86"
    }
    ```
-   **accounts:** a list of accounts (one for each profile, profile value match account key)<br><br>e.g.<br>
    ```json {
    {
        "e6c1005d-4efd-4450-ba96-ffbdbd1d6efa": {
            "profileName": "test",
            "loginChallenge": "685..129",
            "keyInfo": {
                "algorithm": "argon2id",
                "params": { "m": 2048, "t": 128, "p": 1 },
                "salt": "cCs...SX8",
                "version": 19
            }
        },
        "7ea69deb-af83-413d-84c6-3598cb7a6c86": {
            "profileName": "test2"
            ...
            ...
        }
    }
    ```

### Local profile created

After local profile creation you are logged in and you can start using the application.<br>
Now you can save your personal data by writing inside the text area and clicking save button and of course you can log out when you prefer.<br>
When you save your data the application encript the text area value and store it inside your IndexedDB account in the `data` section<br><br>
e.g.<br>

```json {
{
    "e6c1005d-4efd-4450-ba96-ffbdbd1d6efa": {
        "data": "<encripted_text_area_value>",
        "profileName": "test",
        ...
        ...
    }
}
```

### Encription logic - WIP

```
let iv = new Uint8Array(16);
self.crypto.getRandomValues(iv);
account.dataIV = b64AB.encode(iv);
let keyBuffer = b64AB.decode(keyText);
let key = await crypto.subtle.importKey("raw",keyBuffer,"AES-GCM",false,[ "encrypt", ]);
let dataBuffer = (new TextEncoder()).encode(data);
let aesOptions = Object.assign({},aesDefaultOptions,{ iv, });
let encData = await crypto.subtle.encrypt(aesOptions,key,dataBuffer);
account.data = b64AB.encode(encData);
```

## Contributing

PRs for this project are welcome.

If you are looking to contribute to the design, there is an active [Figma project](https://www.figma.com/team_invite/redeem/RGRbYTgALoGkzWFAPiIvKX) in which we test all the visual changes and enhancements prior to being developed. Leave a comment [here](https://github.com/getify/youperiod.app/issues/2) and edit permissions will be granted.

## License

[![License](https://img.shields.io/badge/license-MIT-a1356a)](LICENSE.txt)

All code and documentation are (c) 2022 YouPeriod.app and released under the [MIT License](http://getify.mit-license.org/). A copy of the MIT License [is also included](LICENSE.txt).
