/*
 * responsive-carousel.js - 2013-01-27
 * https://github.com/jerometufte/responsive-carousel
 *
 * Copyright (c) 2011 Jerome Tufte
 * http://jerometufte.me
 *
 * Licensed under the MIT License.
 */


;(function( $, window, document, undefined ){

  //
  // init base gesture names based on whether device supports touch or not
  //
  var _hasTouch = false;
  var _testTouch = function() {
    if (_hasTouch) {
      return _hasTouch;
    }
    if ('ontouchstart' in window) {
      return _hasTouch = true;
    } else {
      return _hasTouch = false;
    }
  };

  //
  // define basic gesture names depending on device
  //

  var _gestures = function(){
    if (_testTouch()){
      return {
        start: "touchstart",
        move: "touchmove",
        end: "touchend",
        cancel: "touchcancel"
      };
    } else {
      return {
        start: "mousedown",
        move: "mousemove",
        end: "mouseup"
      };
    }
  };

  var _cssType = function() {
    $body = document.getElementsByTagName('body')[0]

    if ($body.style.webkitTransform != undefined) {
      return 'webkit';
    } else if ($body.style.MozTransform != undefined) {
      return 'moz';
    } else if ($body.style.msTransform != undefined) {
      return 'ms';
    } else if ($body.style.OTransform != undefined) {
      return 'o';
    }
  };

  var _css = function(){

    var cssType = _cssType();

    switch (cssType) {
      case 'webkit':
        console.log('webkit');
        return {
          transition: '-webkit-transition',
          transform: '-webkit-transform',
          translate3d: 'translate3d'
        };
      break;
      case 'moz':
        console.log('moz');
        return {
          transition: '-moz-transition',
          transform: '-moz-transform',
          translate: 'translate'
        };
      break;
      case 'ms':
        console.log('ms');
        return {
          transition: '-ms-transition',
          transform: '-ms-transform',
          translate: 'translate'
        };
      break;
      case 'ms':
        console.log('0');
        return {
          transition: '-o-transition',
          transform: '-o-transform',
          translate: 'translate'
        };
      break;
    }
  };

  var that = {};

  // our plugin constructor
  var ResponsiveCarousel = function(el, options){
      this._gestures = _gestures();
      this._css = _css();
      this.el = el;
      this.options = options;

      // bind all prototype functions to this object
      that = this;

      return this;
  };

  // the plugin prototype
  ResponsiveCarousel.prototype = {
    defaults: {
      direction: 'horizontal',
      transitionSpeed: 500,
      keyControl: false,
      arrows: false,
      pagination: false,
      paginationEl: '',
      hotClass: true,
      tapToReturn: false,
      callback: null
    },

    init: function() {
      // Introduce defaults that can be extended either
      // globally or using an object literal.
      that.opts = $.extend({}, that.defaults, that.options);

      // declare base DOM elements
      that.state = {};
      that.$el = $(that.el);
      that.$listWrapper = that.$el.children('.rcWrapper');
      that.$list = that.$listWrapper.children('ul');
      that.$slides = that.$list.children('li');

      // declare base calculation variables
      that.offsetUnit = that.$listWrapper.width();
      that.slidesPerPage = Math.round(that.offsetUnit / $(that.$slides[0]).width());
      that.totalPages = that.$slides.length / that.slidesPerPage;

      // setup state object
      that.state.curPage = 1;
      that.state.$curPage = $(that.$slides[0]);
      that.state.curPageOffset = 0;

      // set webkit transition on ul
      // TODO - probably dont' need to do that
      that.$list.css(that._css.transition, that._css.transform + ' .6s ease');

      // init start gesture listener
      that.$list.on(that._gestures.start, that.gestureStart);

      // init options
      if (that.opts.keyControl) {
        that.keyControl();
      }
      if (that.opts.arrows) {
        that.initArrows();
      }
      if (that.opts.pagination) {
        that.initPagination();
      }
      if (that.opts.hotClass) {
        that.initHotClass();
      }
      if (that.opts.tapToReturn) {
        that.initTapToReturn();
      }

      // init callback if defined as function
      if (that.opts.callback && typeof that.opts.callback == 'function') { // make sure the callback is a function
        that.initCallback();
      }

      // add resize listener
      $(window).on('resize', that.resizeListener);

      // trigger a pageChange event to initiate things like arrows and pagination
      that.$el.trigger('rcPageChange');
      $(window).trigger('resize');

      return that;
    },

    gestureStart: function(e) {
      // init new empty gesture object
      // TODO - need to check if gesture is still in progress id: adding second finger etc...
      that.gesture = {};
      that.gesture.startTime = new Date();
      that.gesture.xstart = (e.originalEvent instanceof MouseEvent) ? e.clientX : e.originalEvent.touches[0].pageX;
      that.gesture.ystart = (e.originalEvent instanceof MouseEvent) ? e.clientY : e.originalEvent.touches[0].pageY;

      that.originalTarget = $(e.originalEvent.target);

      // add move and end listeners
      that.$list.on(that._gestures.move, that.gestureMove);
      that.$list.on(that._gestures.end, that.gestureEnd);

      // add a mouseout listener if event is mouse
      // that is necessary cuz to close gesture when leaving window
      if (e.originalEvent instanceof MouseEvent) {
        $('body').on('mouseleave', that.gestureEnd);
      }

      return false;
    },

    gestureMove: function(e) {
      var xd, moveX;

      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();
      e.preventDefault();
      e.stopPropagation();

      // Prevent click events
      var preventClickEvents = function(e) {
        e.preventDefault();
        e.stopPropagation();
        window.removeEventListener("click", preventClickEvents, true);
      };
      window.addEventListener("click", preventClickEvents, true);

      // grab position variables on move
      that.gesture.lastX = (e.originalEvent instanceof MouseEvent) ? e.clientX : e.originalEvent.touches[0].pageX;
      that.gesture.lastY = (e.originalEvent instanceof MouseEvent) ? e.clientY : e.originalEvent.touches[0].pageY;
      that.gesture.xd = that.gesture.lastX - that.gesture.xstart; // x delta

      that.$list.css(that._css.transition, 'none');

      if (!(that.state.curPage == 1 && that.gesture.xd > 0) && !(that.state.curPage == that.totalPages && that.gesture.xd < 0)) {
        moveX = that.state.curPageOffset + that.gesture.xd;
        that.$list.css(that._css.transform, that._css.translate3d ? that._css.translate3d + '(' + moveX + 'px, 0, 0)' : that._css.translate + '(' + moveX + 'px, 0)');
        return false;
      } else {
        var rubberedMoveX = that.gesture.xd * 0.35;
        moveX = that.state.curPageOffset + rubberedMoveX;
        that.$list.css(that._css.transform, that._css.translate3d ? that._css.translate3d + '(' + moveX + 'px, 0, 0)' : that._css.translate + '(' + moveX + 'px, 0)');
        return false;
      }
    },

    gestureEnd: function(e) {
      that.gesture.endTime = new Date();

      // remove move and end listeners
      that.$list.off(that._gestures.move, that.gestureMove);
      that.$list.off(that._gestures.end, that.gestureEnd);
      $('body').off('mouseleave');

      if (Math.abs(that.gesture.xd) >= 10) {
        e.originalEvent.preventDefault();
        e.preventDefault();

        if (that.gesture.lastX < (that.gesture.xstart - 40)) {
          that.swipeRight();
        } else if (that.gesture.lastX > (that.gesture.xstart + 40)) {
          that.swipeLeft();
        } else {
          that.swipeReturn();
        }
        return false;
      } else {
        var el = $(e.originalEvent.target).get(0);
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        el.dispatchEvent(evt);
      }
    },

    swipeRight: function() {
      if (that.state.curPage < that.totalPages) {
        that.showNext();
      } else {
        // that.$list.css('-webkit-transition', '-webkit-transform .4s ease');
        that.$list.css(that._css.transition, that._css.transform + ' .4s ease');
        // that.$list.css('-webkit-transform', 'translate3d(' + that.state.curPageOffset + 'px, 0, 0)');
        that.$list.css(that._css.transform, that._css.translate3d ? that._css.translate3d + '(' + that.state.curPageOffset + 'px, 0, 0)' : that._css.translate + '(' + that.state.curPageOffset + 'px, 0)')
      }
    },

    swipeLeft: function() {
      if (that.state.curPage > 1) {
        that.showPrev();
      } else {
        that.$list.css(that._css.transition, that._css.transform + ' .4s ease');
        that.$list.css(that._css.transform, that._css.translate3d ? that._css.translate3d + '(0, 0, 0)' : that._css.translate + '(0, 0)');
      }
    },

    swipeReturn: function() {
      that.$list.css(that._css.transition, that._css.transform + ' .4s ease');
      that.$list.css(that._css.transform, that._css.translate3d ? that._css.translate3d + '(' + that.state.curPageOffset + 'px, 0, 0)' : that._css.translate + '(' + that.state.curPageOffset + 'px, 0)')
    },

    ifPrev: function() {
      if (that.state.curPage > 1) {
        return that.showPrev();
      } else {
        // console.log('cant go left');
      }
    },

    ifNext: function() {
      if (that.state.curPage < that.totalPages) {
        return that.showNext();
      } else {
        // console.log('cant go right');
      }
    },

    showFirst: function() {
      that.$list.css(that._css.transition, that._css.transform + ' .4s ease');
      that.$list.css(that._css.transform, that._css.translate3d ? that._css.translate3d + '(0, 0, 0)' : that._css.translate + '(0, 0)');
      that.state.curPage = 1;
      that.state.$curPage = $(that.$slides[0]);
      that.state.curPageOffset = 0;

      // trigger custom page change event on the main $el
      that.$el.trigger('rcPageChange');
    },

    showNext: function() {
      var newOffset = (that.state.curPage * that.offsetUnit);
      that.$list.css(that._css.transition, that._css.transform + ' .4s ease');
      that.$list.css(that._css.transform, that._css.translate3d ? that._css.translate3d + '(-' + newOffset + 'px, 0, 0)' : that._css.translate + '(-' + newOffset + 'px, 0)');
      that.state.curPage++;
      that.state.$curPage = $(that.$slides[that.state.curPage - 1]);
      that.state.curPageOffset = -newOffset;

      // trigger custom page change event on the main $el
      that.$el.trigger('rcPageChange');
    },

    showPrev: function() {
      var newOffset = ((that.state.curPage - 2) * that.offsetUnit);
      that.$list.css(that._css.transition, that._css.transform + ' .4s ease');
      that.$list.css(that._css.transform, that._css.translate3d ? that._css.translate3d + '(-' + newOffset + 'px, 0, 0)' : that._css.translate + '(-' + newOffset + 'px, 0)');
      that.state.curPage--;
      that.state.$curPage = $(that.$slides[that.state.curPage - 1]);
      that.state.curPageOffset = -newOffset;

      // trigger custom page change event on the main $el
      that.$el.trigger('rcPageChange');
    },

    // used to show an arbitrary page number
    showPage: function(page) {

      // update state and calculate new offset
      that.state.curPage = parseInt(page, 10);
      var newOffset = ((that.state.curPage - 1) * that.offsetUnit);
      that.state.$curPage = $(that.$slides[that.state.curPage - 1]);
      that.state.curPageOffset = -newOffset;

      // apply the animation
      that.$list.css(that._css.transition, that._css.transform + ' 0s ease');
      that.$list.css(that._css.transform, that._css.translate3d ? that._css.translate3d + '(-' + newOffset + 'px, 0, 0)' : that._css.translate + '(-' + newOffset + 'px, 0)');

      // trigger custom page change event on the main $el
      that.$el.trigger('rcPageChange');
    },

    keyControl: function() {
      $(document).keydown(function (e) {
        var keyCode = e.keyCode || e.which,
            arrow = {left: 37, up: 38, right: 39, down: 40 };

        switch (keyCode) {
          case arrow.left:
            that.ifPrev();
          break;
          case arrow.up:
            // console.log('no function bound to key arrow up');
          break;
          case arrow.right:
            that.ifNext();
          break;
          case arrow.down:
            // console.log('no function bound to key arrow down');
          break;
        }
      });
    },

    reload: function() {
      // reset the variables that determine swipe size and number of items per page
      that.offsetUnit = that.$listWrapper.width();
      that.slidesPerPage = Math.round(that.offsetUnit / that.$list.children(":first").width());
      that.totalPages = that.$slides.length / that.slidesPerPage;

      // reset translated position
      var newOffset = ((that.state.curPage - 1) * that.offsetUnit);
      that.$list.css(that._css.transition, that._css.transform + ' 0 ease');
      that.$list.css('-webkit-transform', 'translate3d(-' + newOffset + 'px, 0, 0)');
    },

    resizeListener: function() {
      if (that.resizeTimer) {
          clearTimeout(that.resizeTimer);
      }
      that.resizeTimer = setTimeout(function() {
          that.reload();
      }, 100);
    },

    initArrows: function() {
      // build arrows, prepend and append to $el, siblings of rcWrapper
      // first look to see if user has already added arrows before building
      var $leftArrow = that.$el.find('.rcL');
      var $rightArrow = that.$el.find('.rcR');
      that.$leftArrow = $leftArrow.length ? $leftArrow : $('<div/>').addClass('rcL').addClass('rcHide').prependTo(that.$el);
      that.$rightArrow = $rightArrow.length ? $rightArrow : $('<div/>').addClass('rcR').addClass('rcHide').appendTo(that.$el);

      // add listeners for the function that looks for page and animates if possible
      that.$leftArrow.on('click', that.ifPrev);
      that.$rightArrow.on('click', that.ifNext);

      // bind arrows toggle to page change
      that.$el.on('rcPageChange', function(){
        that.toggleArrows(that);
      });
    },

    toggleArrows: function(that) {

      // removes the hide class and adds to left or right as needed
      that.$leftArrow.removeClass('rcHide');
      that.$rightArrow.removeClass('rcHide');
      if (that.state.curPage == 1) {
        that.$leftArrow.addClass('rcHide');
      } else if (that.state.curPage == that.totalPages){
        that.$rightArrow.addClass('rcHide');
      }
    },

    initPagination: function() {
      var paginationHTML;
      var _i;
      that.$paginationEl = $('.' + that.opts.paginationEl);
      paginationHTML = '';
      _i = 1;

      // build li's and populate the pagination holder
      for (i = 0; i < that.totalPages; i++) {
        paginationHTML += '<li>' + _i + '</li>';
        _i++;
      }
      that.$paginationEl.append(paginationHTML);

      // bind pagination change to page change
      that.$el.on('rcPageChange', function(){
        that.$paginationEl.children('li').removeClass('rcPaginationHot');
        that.$paginationEl.children('li:nth-child(' + that.state.curPage + ')').addClass('rcPaginationHot');
      });
    },

    initHotClass: function() {
      that.$el.on('rcPageChange', function(){
        that.$slides.removeClass('rcPageHot');
        that.state.$curPage.addClass('rcPageHot');
      });
    },

    initTapToReturn: function() {
      that.$el.on('click', '.rcReturn', function() {
        that.showFirst();
      });
    },

    // call the callback function and pass it the state object
    initCallback: function() {
      that.$el.on('rcPageChange', function(){
        that.opts.callback.call(that);
      });
    }
  };

  ResponsiveCarousel.defaults = ResponsiveCarousel.prototype.defaults;

  $.fn.responsiveCarousel = function(options, callback) {
    callback = callback ? callback : null;
    return new ResponsiveCarousel(this, options, callback).init();
  };

  window.ResponsiveCarousel = ResponsiveCarousel;

})( jQuery, window , document );