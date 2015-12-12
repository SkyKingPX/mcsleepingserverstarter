'use strict';
// var packageSleep = JSON.parse(require('fs').readFileSync('package.json',
// 'utf8'));

var settings = require("js-yaml").load(
		require("fs").readFileSync("sleepingSettings.yml"));

var mc = require('minecraft-protocol');
var connect = require('connect');
var serveStatic = require('serve-static');
var childProcess = require('child_process');

var webServer;
var mcServer;

var init = function() {
	if (settings.webPort > 0) {
		webServer = connect().use(serveStatic(settings.webDir)).listen(
				settings.webPort);
		console.log("Starting web server on *:" + settings.webPort
				+ " webDir: " + settings.webDir);
	}

	mcServer = mc.createServer({
		'online-mode' : true, // optional
		encryption : true, // optional
		host : '0.0.0.0', // optional
		motd : settings.serverName,
		port : settings.serverPort, // optional
	});
	console.log('Waiting for a Prince to come. [' + settings.serverPort + ']');

};
init();

mcServer.on('login', function(client) {
	client.write('login', {
		entityId : client.id,
		levelType : 'default',
		gameMode : 0,
		dimension : 0,
		difficulty : 2,
		maxPlayers : mcServer.maxPlayers,
		reducedDebugInfo : false
	});

	console.log('Prince as come, time to wake up.')

	client.end(settings.loginMessage);
	closeServer();
});

var closeServer = function() {
	console.log('Cleaning up the place.')
	mcServer.close();
	webServer.close();

	if (settings.startMinecraft > 0) {
		console.log('Starting Minecraft : ' + settings.minecraftCommand)
		childProcess.execSync(settings.minecraftCommand);
		
		console.log('Minecraft stopped')
		init();
	}
};