# Technical Documentation: YouPeriod.app

After cloning this project, make sure to run `npm install` to install the dependencies for both server and client.

## Server

The server for this app is basically just a static file server, which applies proper security headers to various resources based on content-type. It is written as a single file Node.js program, located at `./server.js`.

The server defaults to running via HTTP on `localhost` and port `8034`, and can thus be accessed in your browser at `http://localhost:8034` when running the project locally.

To start the server, run the following command from the project root:

```cmd
npm start
```

You can change the port by setting the environment variable `HTTP_SERVER_PORT`. For example:

```cmd
HTTP_SERVER_PORT=8080 npm start
```

That command starts the server on port `8080` instead of `8034`.

### Security Headers

The main purpose of the customized server logic is to send a number of very important security-oriented response headers (depending on resource type):

* CORS (Cross Origin Resource Security): The `Access-Control-Allow-Origin: ..`response header prevents other sites (in the browser) from dynamically requesting or accessing the resources from this site/app.

* CSP (Content Security Policy): restricts certain (unsafe) run-time behaviors in HTML page environments -- which often lead to XSS (Cross-Site Scripting) vulnerabilities -- including preventing unauthorized inline scripts, as well as shutting off all dynamic request calls (Ajax/etc).

* HSTS (HTTP Strict Transport Security): forces sites to only run in browsers under HTTPS context (prevents protocol downgrade attacks).

* No-Sniff (`X-Content-Type-Options: nosniff`): prevents [content-type sniffing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options) vulnerabilities

In addition, the HTML markup relies on [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) to authorize and verify inline `<script>` (or `<style>`, etc) blocks, like the `<script>` block used in the `<head>` that computes and injects CSS variables.

### Node-Static-Alias (Fork)

Besides the security headers, the static file server logic also applies proper caching and gzip compression for served resources.

The package used for the static file server is [a fork of](https://www.npmjs.com/package/@getify/node-static-alias) the [`Node-Static-Alias`](http://npmjs.com/package/node-static-alias) package.

This fork implements a few additions to the base package's normal capabilities, including:

* An `onContentType(..)` callback in the server settings is invoked for each resource, along with its identified content-type (`text/html`, etc) and any currently specified headers, to allow setting additional HTTP response headers based on content-type.

    For example, per specification, CSP (Content Security Policy) headers should only be sent with `text/html` resources, and are invalid and discouraged for all other content types.

* The alias routes additionally support `async function` callbacks (`match` and `serve`), for asynchronous serving routing logic, instead of only synchronous callbacks.

    For example, you might need to asynchonously validate a server session (based on request headers), say from a database, before deciding which route should match/handle a given request.

## Client

Details TBA. (TODO)

### First login - local profile creation

This application is written with HTML + CSS + JS and under the hood use NodeJs http module `require("http")` to create a server `http.createServer(handleRequest)` on port `8034`.

When the end user hit the homepage there are some information to fill

-   profile name/description - _at least 2 letters long_
-   secret phrase (with confirmation check) - _at least 12 letters long_

with these info the application will create an unique local profile into IndexedDB database called `keyval-store`.

Inside `keyval-store` the application store key/value objects.

-   **profile:** a list of saved profiles (you can have more then one)

    e.g.
    ```json
    {
        "test": "e6c1005d-4efd-4450-ba96-ffbdbd1d6efa",
        "test2": "7ea69deb-af83-413d-84c6-3598cb7a6c86"
    }
    ```
-   **accounts:** a list of accounts (one for each profile, profile value match account key)

    e.g.
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
