var DEBUG_MODE = 'DEV_TOOL_DEBUG_MODE';
var FEATURE_FLAGS = 'DEV_TOOL_FEATURE_FLAGS';
var debugModeEnabled = getDebugMode();
if(debugModeEnabled) {
  setEnvAttributeToDevelopment();
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const action = request && request.action ? request.action : '';
  switch (action) {
    case 'toggleDebugMode':
      toggleDebugMode();

      break;
    case 'toggleFeatureFlag':
      toggleFeatureFlag(request.payload.key);

      break;

    case 'getDebugMode':
        var debugMode = getDebugMode();
        sendResponse(debugMode);
      break;

    case 'getConfig':
      const featureFlags = getConfig();
      sendResponse(featureFlags);
      break;
    default:
      console.log('No action ', action);
  }
});

function setEnvAttributeToDevelopment() {
  // Set env to development so angular debug tools are enabled
  document.querySelector('body').setAttribute('data-env', 'development');
}

function setFeatureFlags(flags) {
  localStorage.setItem(FEATURE_FLAGS, JSON.stringify(flags));
}

function getFeatureFlags() {
  var flags = localStorage.getItem(FEATURE_FLAGS);
  return flags ? JSON.parse(flags) : {};
}

function setDebugMode(bool) {
  localStorage.setItem(DEBUG_MODE, bool);
}

function getDebugMode() {
  var bool = localStorage.getItem(DEBUG_MODE);
  return bool === 'true';
}

function toggleDebugMode() {
  const enabled = getDebugMode();
  setDebugMode(!enabled);
}

function toggleFeatureFlag(flag) {
  const flags = getFeatureFlags();

  flags[flag] = !flags[flag];

  //Update feature flag in angular service:
  try {
    var configService = getConfigServiceFromAngular();
    configService.config.featureFlags[flag] = configService.config.featureFlags[flag];
  } catch {
    console.log('Unable to set feature flag ' + flag + ' in angular config service');
  }

  setFeatureFlags(flags);
}

function getConfig() {
  // Element where the app is bootstrapped on
  var config;
  try {
    var configService = getConfigServiceFromAngular();
    var oldConfig = getFeatureFlags();

    config = Object.assign({}, configService.config, oldConfig);
  } catch (e) {
    console.error(e);

    config = { featureFlags: getFeatureFlags() };
  }

  setFeatureFlags(config.featureFlags);

  return Object
    .entries(config.featureFlags)
    .map(function (feature) {
      return { name: feature[0], status: feature[1] };
    });

}

function getConfigServiceFromAngular() {
  var app = document.querySelector('app');

  // Use debug tools to get a reference to the config service
  return ng.probe(app).injector.view.root.ngModule._providers.filter(x => x.__proto__.constructor.name === 'AppConfig').pop()
}