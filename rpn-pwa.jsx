// rpn-pwa.jsx — patches IOSDevice to be a transparent wrapper in mobile/standalone mode
(function () {
  var isPWA = window.navigator.standalone === true ||
              window.matchMedia('(display-mode: standalone)').matches;
  var isMobile = window.innerWidth <= 500;

  if (isPWA || isMobile) {
    window.IOSDevice = function ({ children }) {
      return React.createElement(React.Fragment, null, children);
    };
  }
})();
