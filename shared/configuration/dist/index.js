"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var fs_1 = require("fs");
var createDebug = require("debug");
var debug = createDebug('configuration');
var loadJsonFile = function (filename) {
    var path = path_1.resolve(process.cwd(), filename);
    debug("Load file " + path);
    try {
        var text = fs_1.readFileSync(path).toString();
        return JSON.parse(text);
    }
    catch (e) {
        debug("cannot load config file " + path);
        debug(e);
        return {};
    }
};
var environment = process.env.NODE_ENV || 'development';
var defaultConfig = loadJsonFile('config/default.json');
var envConfig = loadJsonFile("config/" + environment + ".json");
exports.default = Object.assign(defaultConfig, envConfig, process.env);
//# sourceMappingURL=index.js.map