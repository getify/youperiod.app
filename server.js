"use strict";

process.on("uncaughtException",function(err){
	console.log(err.stack);
});


var path = require("path");
var http = require("http");
var httpServer = http.createServer(handleRequest);

var nodeStaticAlias = require("@getify/node-static-alias");

var AccessControlHeader = {
	"Access-Control-Allow-Origin": "https://youperiod.app",
};
var HSTSHeader = {
	"Strict-Transport-Security": `max-age=${ 1E9 }`,
};
var noSniffHeader = {
	// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
	"X-Content-Type-Options": "nosniff",
};
var CSPHeader = {
	"Content-Security-Policy":
		[
			`default-src ${[
				"'self'",
			].join(" ")};`,

			`style-src ${[
				"'self'",
				"'unsafe-inline'",
			].join(" ")};`,

			`script-src ${[
				"'self'",
				// inline <script> tag for re-computing the vw/vh units
				"'sha256-CoCYJ/tTxH9vJyISOUlowiGKF8OokDL5QBuS3H8R1/g='",
			].join(" ")};`,

			`connect-src ${[
				"'none'",
			].join(" ")};`
		].join(" ")
};

const STATIC_DIR = path.join(__dirname,"web");
const DEV = true;
const CACHE_FILES = false;
const PORT = 8034;

var staticServer = new nodeStaticAlias.Server(STATIC_DIR,{
	serverInfo: "YouPeriod",
	cache: CACHE_FILES ? (60 * 60 * 3) : 0,
	gzip: /^(?:(?:text\/.+)|(?:image\/svg\+xml)|(?:application\/javascript)|(?:application\/json)|(?:application\/manifest\+json))(?:; charset=utf-8)?$/,
	headers: {
		...AccessControlHeader,
		...(!DEV ? HSTSHeader : {}),
	},
	onContentType(contentType,headers) {
		// apparently this is the new preferred mime-type for JS
		if (contentType == "application/javascript") {
			contentType = "text/javascript";
		}

		// only add CSP headers for text/html pages
		if (contentType == "text/html") {
			Object.assign(headers,CSPHeader);
		}

		// no-sniff header for CSS and JS only
		if (/^(?:text\/(?:css|javascript))|(?:application\/json)$/.test(contentType)) {
			Object.assign(headers,noSniffHeader);
		}

		// add utf-8 charset for some text file types
		if (
			/^((text\/(?:html|css|javascript))|(?:application\/json)|(image\/svg\+xml)|(application\/manifest\+json))$/.test(contentType)
		) {
			contentType = `${contentType}; charset=utf-8`;
		}

		return contentType;
	},
	alias: [
		// basic static page friendly URL rewrites
		{
			match: /\/(?:index(?:\.html)?)?(?:[#?]|$)/,
			serve: "index.html",
			force: true,
		},
	],
});

httpServer.listen(PORT,()=> {console.log(`Server started on port ${PORT}`)});


// *************************************

function handleRequest(req,res) {
	if (!DEV && !/^youperiod\.app$/.test(req.headers["host"])) {
		res.writeHeader(307,{
			Location: `https://youperiod.app${req.url}`,
			"Cache-Control": "public, max-age=3600",
			Expires: new Date(Date.now() + (3600 * 1000) ).toUTCString(),
		});
		res.end();
	}
	// unconditional, permanent HTTPS redirect
	else if (!DEV && req.headers["x-forwarded-proto"] !== "https") {
		res.writeHead(301,{
			"Cache-Control": "public, max-age=31536000",
			Expires: new Date(Date.now() + 31536000000).toUTCString(),
			Location: `https://youperiod.app${req.url}`
		});
		res.end();
	}
	else {
		onRequest(req,res);
	}
}

async function onRequest(req,res) {
	if (["GET","HEAD"].includes(req.method)) {
		if (!DEV) {
			// basic page load logging
			if (/^\/(?:index\.html)?(?:[\?#]|$)/.test(req.url)) {
				console.log(`page request: ${
					req.headers["x-forwarded-for"]?.split(',').shift() ||
					req.socket?.remoteAddress
				} | ${new Date(Date.now()).toLocaleString("en-US")}`);
			}

			// special cache expiration behavior for favicon
			if (/^\/favicon\.ico$/.test(req.url)) {
				try {
					await serveFile(req.url,200,{
						"Cache-Control": `public, max-age=${60*60*24*30}`,
						...HSTSHeader,
					},req,res);
				}
				catch (err) {
					res.writeHead(404);
					res.end();
				}
				return;
			}
		}

		// handle all other static files
		staticServer.serve(req,res,async function onStaticComplete(err){
			if (err) {
				try {
					return await serveFile("/index.html",200,{
						...HSTSHeader,
						...CSPHeader,
					},req,res);
				}
				catch (err2) {}
			}

			res.writeHead(404);
			res.end();
		});
	}
	else {
		res.writeHead(404);
		res.end();
	}
}

function serveFile(url,statusCode,headers,req,res) {
	var listener = staticServer.serveFile(url,statusCode,headers,req,res);
	return new Promise(function c(resolve,reject){
		listener.on("success",resolve);
		listener.on("error",reject);
	});
}
