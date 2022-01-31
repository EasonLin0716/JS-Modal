import { fadeIn, fadeOut } from "./utils";

export default (function () {
  /**
   * modal default options
   *
   * @property {array} containerClasses Outer container css classes, accept multiple classes.
   * @property {string} closeClass Closing icon css class.
   * @property {string} modalClass Modal content container class. This class will be append to the element passed in modal.open
   * @property {number} fadeDuration Fading duration.
   * @property {number} fadeDelay Modal content fade delay.
   * @property {boolean} showClose Allow display close button or not.
   * @property {boolean} escapeClose Allow close by escape button.
   * @property {boolean} clickClose Allow close by clicking background.
   * @property {boolean} allowDrag Allow modal to be dragged.
   */
  var defaultOptions = {
    containerClasses: ["mask"],
    closeClass: "close-modal",
    modalClass: "modal",
    fadeDuration: 260,
    fadeDelay: 0.6,
    showClose: true,
    escapeClose: true,
    clickClose: true,
    allowDrag: false,
  };
  var activeModals = [];

  /**
   * Create modal outer container
   *
   * @returns {object} Modal outer container dom
   */
  function createModalContainer() {
    var container = document.createElement("div");
    var classes = defaultOptions.containerClasses;
    classes.forEach(function (addingClass) {
      container.classList.add(addingClass);
    });
    return container;
  }

  /**
   * Create modal close button
   *
   * @returns {object} Modal close button dom
   */
  function createModalCloseButton() {
    var closeBtn = document.createElement("a");
    closeBtn.href = "javascript:;";
    closeBtn.classList.add(defaultOptions.closeClass);
    closeBtn.addEventListener("click", function () {
      close();
    });
    return closeBtn;
  }

  /**
   * Global esc listener
   *
   * @param {object} event Document event
   */
  function closeOnEscape(event) {
    if (event.key === "Escape") close();
  }

  /**
   * Customize options
   *
   * @param {object} customOptions custom options
   */
  function setOptions(customOptions) {
    for (var k in customOptions) {
      if (defaultOptions[k]) defaultOptions[k] = customOptions[k];
    }
  }

  function mergeOptions(customOptions) {
    var mergedOption = JSON.parse(JSON.stringify(defaultOptions));
    if (typeof customOptions === "object") {
      for (var k in customOptions) {
        mergedOption[k] = customOptions[k];
      }
    }
    return mergedOption;
  }

  /**
   * open modal
   *
   * @param {object} el dom element to be opened in modal
   * @param {object} options custom options default to empty object
   */
  function open(el, options = {}) {
    var _options = mergeOptions(options);

    el.classList.add(_options.modalClass);

    if (_options.showClose) {
      var closeBtn = createModalCloseButton();
      el.appendChild(closeBtn);
    }

    var container = createModalContainer();
    document.body.appendChild(container);
    container.appendChild(el);

    if (_options.clickClose) {
      container.addEventListener("click", function (e) {
        if (e.target === container) close();
      });
    }

    if (_options.escapeClose) {
      document.addEventListener("keydown", closeOnEscape);
    }

    if (activeModals.length === 0) blockScroll();

    fadeIn(container, "", _options.fadeDuration);
    if (_options.fadeDelay) {
      setTimeout(function () {
        fadeIn(el, "inline-block", _options.fadeDuration);
      }, _options.fadeDelay * _options.fadeDuration);
    } else {
      fadeIn(el, "inline-block", _options.fadeDuration);
    }

    activeModals.push({ container: container, _options: _options });

    if (_options.allowDrag) {
      drag();
    }
  }

  /**
   * close modal
   *
   */
  function close() {
    if (!activeModals.length) return;

    var _options = activeModals[activeModals.length - 1]._options;

    if (_options.escapeClose) {
      document.removeEventListener("keydown", closeOnEscape);
    }

    var container = activeModals[activeModals.length - 1].container;
    var el = container.querySelector(`.${_options.modalClass}`);

    fadeOut(el, _options.fadeDuration);
    fadeOut(container, _options.fadeDuration);

    if (activeModals.length === 1) unblockScroll();

    activeModals.pop();

    setTimeout(function () {
      document.body.appendChild(el);
      if (_options.showClose) {
        var closeBtn = el.querySelector(`.${_options.closeClass}`);
        closeBtn.remove();
      }
      container.remove();
    }, _options.fadeDuration);
  }

  /**
   * drag function
   * @returns
   */
  function drag() {
    if (!activeModals.length) return;

    var _options = activeModals[activeModals.length - 1]._options;

    if (!_options || !_options.allowDrag) return;

    var LEFT_REMAIN = 30,
      TOP_REMAIN = 30;

    var container = activeModals[activeModals.length - 1].container;
    var el = container.querySelector(`.${_options.modalClass}`);

    initDragRequiredStyles();

    var initialShiftLeft = 0,
      initialShiftTop = 0;
    var shiftLeft = 0,
      shiftTop = 0;

    el.addEventListener("mousedown", handleMouseDown);

    function handleMouseDown(event) {
      var target = event.target;
      if (isInput(target)) return;

      if (isIE()) {
        // prevent ie side effect
        document.body.classList.add("ie-select--disabled");
      }

      setInitialShiftLocation(event);

      document.addEventListener("mousemove", dragStart);
      document.addEventListener("mouseup", handleMouseUp);
    }

    function handleMouseUp() {
      if (isIE()) {
        // prevent ie side effect
        document.body.classList.remove("ie-select--disabled");
      }

      document.removeEventListener("mousemove", dragStart);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    function dragStart(event) {
      // prevent ie side effect
      if (isIE()) {
        event.stopPropagation();
      }
      event.preventDefault();
      // calculate location
      var newLocation = getLimitCalculatedLocation(event);
      shiftLeft = newLocation.left;
      shiftTop = newLocation.top;
      updateElementLocation();
    }

    /**
     * update shifting
     */
    function setInitialShiftLocation(event) {
      var elementCurrentLeft = Number(el.style.left.replace("px", ""));
      var elementCurrentTop = Number(el.style.top.replace("px", ""));
      initialShiftLeft = event.clientX - elementCurrentLeft;
      initialShiftTop = event.clientY - elementCurrentTop;
    }

    /**
     * calculate location limitation
     * @returns {object} computed left, top vals
     */
    function getLimitCalculatedLocation(event) {
      var newShiftLeft = event.clientX - initialShiftLeft;
      var newShiftTop = event.clientY - initialShiftTop;

      var limitedPositions = getLimitedPositions();
      // compute left and right
      if (newShiftLeft < 0) {
        if (Math.abs(newShiftLeft) > limitedPositions.left) {
          // fix left reached limits
          newShiftLeft = -limitedPositions.left;
        }
      } else {
        if (newShiftLeft > limitedPositions.left) {
          // fix right reached limits
          newShiftLeft = limitedPositions.left;
        }
      }

      // compute up and down
      if (newShiftTop < 0) {
        // fix up reached limits
        if (Math.abs(newShiftTop) > limitedPositions.top) {
          newShiftTop = -limitedPositions.top;
        }
      } else {
        // fix down reached limits
        if (newShiftTop > limitedPositions.top) {
          newShiftTop = limitedPositions.top;
        }
      }

      var newLocation = {
        left: newShiftLeft,
        top: newShiftTop,
      };

      return newLocation;
    }

    /**
     * calculate modal edge val in browser
     * @returns {object} left is horizontal max value; top is vertical max value
     */
    function getLimitedPositions() {
      var modalWidth = el.clientWidth;
      var modalHeight = el.clientHeight;
      var viewportWidth = window.innerWidth;
      var viewportHeight = window.innerHeight;
      var leftMaskWidth = Math.floor((viewportWidth - modalWidth) / 2);
      var topMaskWidth = Math.floor((viewportHeight - modalHeight) / 2);

      var limitedPositions = {
        left: leftMaskWidth + modalWidth - LEFT_REMAIN,
        top: topMaskWidth + modalHeight - TOP_REMAIN,
      };

      return limitedPositions;
    }

    /**
     * update element location
     */
    function updateElementLocation() {
      el.style.left = shiftLeft + "px";
      el.style.top = shiftTop + "px";
    }

    /**
     * init element basic styles
     */
    function initDragRequiredStyles() {
      el.style.left = "0px";
      el.style.top = "0px";
      el.parentElement.style.overflow = "hidden";
    }

    /**
     * check if element is input
     * @param {object} element dom element
     * @returns {boolean} is input or not
     */
    function isInput(element) {
      var INPUT_NODE_NAMES = ["INPUT", "TEXTAREA", "SELECT"];
      return element && INPUT_NODE_NAMES.indexOf(element.nodeName) !== -1;
    }

    /**
     * check if browser is ie
     * @returns {boolean} is ie or not
     */
    function isIE() {
      var inBrowser = typeof window !== "undefined";
      var UA = inBrowser && window.navigator.userAgent.toLowerCase();
      return UA && /msie|trident/.test(UA);
    }
  }

  /**
   * block scroll
   *
   */
  function blockScroll() {
    var scrollTop = document.body?.getBoundingClientRect()?.top || 0;
    var bodyStyle = document.body.style;
    bodyStyle.top = `${scrollTop}px`;
    bodyStyle.width = "100%";
    bodyStyle.overflowX = "hidden";
    bodyStyle.overflowY = "scroll";
    bodyStyle.position = "fixed";
  }

  /**
   * unblock scroll
   *
   */
  function unblockScroll() {
    var scrollTop = Math.abs(document.body?.getBoundingClientRect()?.top) || 0;
    var bodyStyle = document.body.style;
    bodyStyle.overflowX = "unset";
    bodyStyle.overflowY = "unset";
    bodyStyle.position = "static";
    bodyStyle.width = "auto";
    window.scrollTo(0, scrollTop);
  }

  return {
    open,
    close,
    setOptions,
  };
})();
