/**
 * 淡入功能
 * 
 * @param {object} el 要淡入的DOM元素 
 * @param {string} display 顯示時的display屬性(block, inline-block, inline, flex...)
 * @param {number} duration 淡入的毫秒數，預設為400，若設為0則跳過淡入動畫直接呈現
 * @param {function} callback 淡入後呼叫的函式
 */
 export const fadeIn = function (el, display="inline-block", duration=400, callback) {
  if (!el) {
    throw new Error('missing el argument');
  };

  el.style.opacity = el.style.opacity || 0;
  el.style.display = display;
  el.style.visibility = "visible";

  if(duration) {
      let opacity = parseFloat(el.style.opacity) || 0;
      const timer = setInterval( function() {
      opacity += 20 / duration;
      if( opacity >= 1 ) {
          clearInterval(timer);
          opacity = 1;
          if (typeof callback === 'function') {
              callback();
          }
      }
      el.style.opacity = opacity;
      }, 20 );
  }
  else {
      el.style.opacity = 1;
  }
}; 

/**
* 淡出功能
* 
* @param {object} el 要淡出的DOM元素 
* @param {number} duration 淡出的毫秒數，預設為400，若設為0則直接跳過淡出動畫直接消失
* @param {function} callback 淡出後呼叫的函式
*/
export const fadeOut = function(el, duration=400, callback) {
    if (!el) {
        throw new Error('missing el argument');
    };

  if(duration) {
      let opacity = 1;
      const timer = setInterval( function() {
      opacity -= 20 / duration;
      if(opacity <= 0) {
          clearInterval(timer);
          opacity = 0;
          el.style.display = "none";
          el.style.visibility = "hidden";
          if (typeof callback === 'function') {
              callback();
          }
      }
      el.style.opacity = opacity;
      }, 20);
  } else {
      el.style.opacity = 0;
      el.style.display = "none";
      el.style.visibility = "hidden";
  }
};
