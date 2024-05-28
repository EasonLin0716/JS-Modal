import { fadeIn, fadeOut } from "./utils";

interface ModalOptions {
  [key: string]: any;
}
interface ActiveModal {
  container: HTMLDivElement;
  _options: ModalOptions;
}

export default (function () {
  /**
   * modal 預設選項
   *
   * @property {array} containerClasses modal 最外層包覆的 CSS classes
   * @property {string} closeClass 關閉按鈕的 CSS class
   * @property {string} modalClass Modal 的 CSS class
   * @property {number} fadeDuration 淡入淡出動畫秒數
   * @property {number} fadeDelay Modal 內容淡入的延遲時間
   * @property {boolean} showClose 是否顯示 X 按鈕
   * @property {boolean} escapeClose 是否能透過 ESC 按鈕關閉 Modal
   * @property {boolean} clickClose 是否能透過點選 Mask 區塊關閉
   */
  var defaultOptions: ModalOptions = {
    containerClasses: ["mask", "blocker", "current"],
    closeClass: "close-modal",
    modalClass: "modal",
    fadeDuration: 260,
    fadeDelay: 0.6,
    showClose: true,
    escapeClose: true,
    clickClose: true,
    allowDrag: false,
  };
  var activeModals: ActiveModal[] = [];

  /**
   * 建立 Modal 外層的 Container
   *
   * @param {object} 自定義選項
   * @returns {object} Modal 的外層 Container DOM 元素
   */
  function createModalContainer(options: ModalOptions = defaultOptions) {
    var container: HTMLDivElement = document.createElement("div");
    var classes: string[] = options.containerClasses || [];
    classes.forEach(function (addingClass) {
      container.classList.add(addingClass);
    });
    return container;
  }

  /**
   * 建立 Modal 的關閉按鈕
   *
   * @param {object} 自定義選項
   * @returns {object} Modal 的外層 Button DOM 元素
   */
  function createModalCloseButton(options = defaultOptions) {
    var closeBtn: HTMLAnchorElement = document.createElement("a");
    closeBtn.href = "javascript:;";
    closeBtn.classList.add(options.closeClass || ""); // Provide a default value of an empty string if options.closeClass is undefined
    closeBtn.addEventListener("click", function () {
      close();
    });
    return closeBtn;
  }

  /**
   * 綁定於全域用於監聽 Esc 按鈕，當 Esc 按鈕觸發時呼叫 close 方法
   *
   * @param {object} event Document 綁定的事件
   */
  function closeOnEscape(event: KeyboardEvent) {
    if (event.key === "Escape") close();
  }

  /**
   * 客製化 options
   *
   * @param {object} customOptions 傳入欲修改的屬性
   */
  function setOptions(customOptions: ModalOptions) {
    Object.keys(customOptions).forEach((key) => {
      const k = key as keyof ModalOptions;
      if (customOptions[k] !== undefined) {
        defaultOptions[k] = customOptions[k]!;
      }
    });
  }

  function mergeOptions(customOptions: ModalOptions) {
    var mergedOption = JSON.parse(JSON.stringify(defaultOptions));
    if (typeof customOptions === "object") {
      for (var k in customOptions) {
        mergedOption[k] = customOptions[k];
      }
    }
    return mergedOption;
  }

  /**
   * 開啟modal
   *
   * @param {object} el 要從modal開啟的DOM元素
   * @param {object} options 客製化選項(預設為defaultOptions)
   */
  function open(el: HTMLElement, options = {}) {
    var _options = mergeOptions(options);

    el.classList.add(_options.modalClass);

    if (_options.showClose) {
      var closeBtn = createModalCloseButton(_options);
      el.appendChild(closeBtn);
    }

    var container = createModalContainer(_options);
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
   * 關閉modal
   *
   * @param {object} options 客製化選項(預設為defaultOptions)
   */
  function close() {
    if (!activeModals.length) return;

    var _options = activeModals[activeModals.length - 1]._options;

    if (_options.escapeClose) {
      document.removeEventListener("keydown", closeOnEscape);
    }

    var container: HTMLElement =
      activeModals[activeModals.length - 1].container;
    var el: HTMLElement = container.querySelector(
      `.${_options.modalClass}`
    ) as HTMLElement;

    fadeOut(el, _options.fadeDuration);
    fadeOut(container, _options.fadeDuration);

    if (activeModals.length === 1) unblockScroll();

    activeModals.pop();

    setTimeout(function () {
      document.body.appendChild(el);
      if (_options.showClose) {
        var closeBtn: HTMLElement = el.querySelector(
          `.${_options.closeClass}`
        ) as HTMLElement;
        closeBtn.remove();
      }
      container.remove();

      const closeEvt = new CustomEvent("modal:after-close");
      el.dispatchEvent(closeEvt);
    }, _options.fadeDuration);
  }

  /**
   * 拖曳功能
   * @returns
   */
  function drag() {
    if (!activeModals.length) return;

    var _options: ModalOptions = activeModals[activeModals.length - 1]._options;

    if (!_options || !_options.allowDrag) return;

    var LEFT_REMAIN: number = 30,
      TOP_REMAIN: number = 30;

    var container: HTMLElement =
      activeModals[activeModals.length - 1].container;
    var el: HTMLElement = container.querySelector(
      `.${_options.modalClass}`
    ) as HTMLElement;

    initDragRequiredStyles();

    var initialShiftLeft = 0,
      initialShiftTop = 0;
    var shiftLeft = 0,
      shiftTop = 0;

    el.addEventListener("mousedown", handleMouseDown);

    function handleMouseDown(event: MouseEvent) {
      // 避免 Modal 後方反白副作用(IE Only)
      var target: HTMLElement = event.target as HTMLElement;
      if (isInput(target)) return;

      if (isIE()) {
        // 針對 IE Disable body 的 user-select 避免 Modal 後方也吃到反白
        document.body.classList.add("ie-select--disabled");
      }

      setInitialShiftLocation(event);

      document.addEventListener("mousemove", dragStart);
      document.addEventListener("mouseup", handleMouseUp);
    }

    function handleMouseUp() {
      if (isIE()) {
        // 針對 IE enable body 的 user-select
        document.body.classList.remove("ie-select--disabled");
      }

      document.removeEventListener("mousemove", dragStart);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    function dragStart(event: MouseEvent) {
      // 避免 Modal 後方反白副作用
      if (isIE()) {
        event.stopPropagation();
      }
      event.preventDefault();
      // 計算偏移值
      var newLocation = getLimitCalculatedLocation(event);
      shiftLeft = newLocation.left;
      shiftTop = newLocation.top;
      updateElementLocation();
    }

    /**
     * 更新水平、垂直起始偏移值
     */
    function setInitialShiftLocation(event: MouseEvent) {
      var elementCurrentLeft = Number(el.style.left.replace("px", ""));
      var elementCurrentTop = Number(el.style.top.replace("px", ""));
      initialShiftLeft = event.clientX - elementCurrentLeft;
      initialShiftTop = event.clientY - elementCurrentTop;
    }

    /**
     * 計算經過水平及垂直極限校正後的拖曳值
     * @returns {object} 校正後的拖曳值 left, top
     */
    function getLimitCalculatedLocation(event: MouseEvent) {
      var newShiftLeft = event.clientX - initialShiftLeft;
      var newShiftTop = event.clientY - initialShiftTop;

      var limitedPositions = getLimitedPositions();
      // 左右校正
      if (newShiftLeft < 0) {
        if (Math.abs(newShiftLeft) > limitedPositions.left) {
          // 向左超過偏移值，進行校正
          newShiftLeft = -limitedPositions.left;
        }
      } else {
        if (newShiftLeft > limitedPositions.left) {
          // 向右超過偏移值，進行校正
          newShiftLeft = limitedPositions.left;
        }
      }

      // 上下校正
      if (newShiftTop < 0) {
        // 向上超過偏移值，進行校正
        if (Math.abs(newShiftTop) > limitedPositions.top) {
          newShiftTop = -limitedPositions.top;
        }
      } else {
        // 向下超過偏移值，進行校正
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
     * 依瀏覽器現狀計算 modal 可超出邊界的最大值
     * @returns {object} left 為水平最大值；top 為垂直最大值
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
     * 更新 element 位置
     */
    function updateElementLocation() {
      el.style.left = shiftLeft + "px";
      el.style.top = shiftTop + "px";
    }

    /**
     * 增加 element 所需的基礎 style
     */
    function initDragRequiredStyles() {
      el.style.left = "0px";
      el.style.top = "0px";
      if (el.parentElement) {
        el.parentElement.style.overflow = "hidden";
      }
    }

    /**
     * 確認DOM節點是否為輸入元素
     * @param {object} element DOM節點
     * @returns {boolean} 是否為輸入元素
     */
    function isInput(element: HTMLElement) {
      var INPUT_NODE_NAMES = ["INPUT", "TEXTAREA", "SELECT"];
      return element && INPUT_NODE_NAMES.indexOf(element.nodeName) !== -1;
    }

    /**
     * 判斷瀏覽器是否為IE
     * @returns {boolean} 是否為IE瀏覽器
     */
    function isIE() {
      var inBrowser = typeof window !== "undefined";
      var UA = inBrowser && window.navigator.userAgent.toLowerCase();
      return UA && /msie|trident/.test(UA);
    }
  }

  /**
   * 阻擋滾動軸
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
   * 回復滾動軸
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
