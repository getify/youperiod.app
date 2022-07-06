## Specs

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
When you save your data the application encrypt the text area value and store it inside your IndexedDB account in the `data` section<br><br>
e.g.<br>

```json {
{
    "e6c1005d-4efd-4450-ba96-ffbdbd1d6efa": {
        "data": "<encrypted_text_area_value>",
        "profileName": "test",
        ...
        ...
    }
}
```

### Js file structure

-   **main** the entry point file. In this file we attach event listeners and we manipulate the dom. In this file we create also the web worker `new Worker("/js/auth-worker.js");`
-   **auth-worker** this is a the Web Worker file and create/check the auth into IndexedDB database
-   **data-manager** this file manage user encrypted data and expose _get_ and _set_ functions
-   **utils** some utils functions
-   **window-resize** in this file we change the application style every time the viewport size change

In **js/external** folder there is `idb-keyval` for manage IndexedDB part and `argon2.umd.min` + `base64-arraybuffer.umd` for the encryption logic
