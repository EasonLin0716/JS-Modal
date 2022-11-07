/**
 * 淡入功能
 *
 * @param {object} el 要淡入的DOM元素
 * @param {string} display 顯示時的display屬性(block, inline-block, inline, flex...)
 * @param {number} duration 淡入的毫秒數，預設為400
 */
export const fadeIn = function (el, display, duration) {
  if (el.isFadeIn) return;
  el.isFadeIn = true;
  duration = duration || 400;
  el.style.opacity = 0;
  el.style.display = display || "block";
  var runningPeriodInSecond = 1000 / 60;
  var updatingGrowth = 1 / (duration / runningPeriodInSecond);
  (function fade() {
    var val = parseFloat(el.style.opacity);
    if (!((val += updatingGrowth) > 1)) {
      el.style.opacity = val;
      requestAnimationFrame(fade);
    }
  })();
  setTimeout(() => {
    el.style.opacity = 1;
    el.isFadeOut = false;
  }, duration);
};

/**
 * 淡出功能
 *
 * @param {object} el 要淡出的DOM元素
 * @param {number} duration 淡出的毫秒數，預設為400
 */
export const fadeOut = function (el, duration) {
  if (el.isFadeOut) return;
  el.isFadeOut = true;
  duration = duration || 400;
  el.style.opacity = 1;
  var runningPeriodInSecond = 1000 / 60;
  var updatingGrowth = 1 / (duration / runningPeriodInSecond);
  (function fade() {
    if ((el.style.opacity -= updatingGrowth) < 0) {
      el.style.display = "none";
    } else {
      requestAnimationFrame(fade);
    }
  })();
  setTimeout(() => {
    el.style.opacity = 0;
    el.isFadeIn = false;
  }, duration);
};
