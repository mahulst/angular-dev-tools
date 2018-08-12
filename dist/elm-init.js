document.addEventListener('DOMContentLoaded', function () {

  var element = document.getElementById('app');

  messageToChrome({ action: 'getDebugMode' }, function (debugMode) {
    var app = Elm.Main.init({ node: element, flags: { debugMode: debugMode } });
    window.app = app;

    app.ports.toggleDebugMode.subscribe(function () {
      messageToChrome({ action: 'toggleDebugMode' });
    });

    app.ports.toggleFeatureFlag.subscribe(function (key) {
      messageToChrome({ action: 'toggleFeatureFlag', payload: { key: key } });
    });

    messageToChrome({ action: 'getConfig' }, function (featureFlags) {
      console.log('featureFlags', featureFlags)
      app.ports.availableFeatureFlags.send(featureFlags);
    });
  });
});


function messageToChrome(message, callback) {
  try {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, message, callback);
    });
  } catch (e) {
    console.log('failed sending: "' + message + '" to browser');
  }
}