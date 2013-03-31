(function () {
  var Portfolio = window.Portfolio || {};
  window.Portfolio = Portfolio;

  Portfolio.init = function () {
    this.checkIfMobile();

    // cache some dom elements
    this.$infoOverlay = $('#infoOverlay');
    this.$info = $('.info');
    this.initCarousel();
    this.initThumbnailMode();
    this.initInfo();
  };

  Portfolio.checkIfMobile = function () {
    var _hasTouch;
    var _testTouch = function() {
      if (_hasTouch) return _hasTouch;
      if ('ontouchstart' in window) {
        return _hasTouch = true;
      } else {
        return _hasTouch = false;
      }
    };
    if (_testTouch()) {
      $('body').addClass('hasTouch');
    } else {
      $('body').addClass('nonTouch')
    }
  };

  Portfolio.initCarousel = function () {
    this.Carousel = $('.portfolio').responsiveCarousel({
      direction: 'horizontal',
      transitionSpeed: 500,
      keyControl: true,
      arrows: true,
      pagination: true,
      paginationEl: 'paginationList',
      tapToReturn: true,
      callback: function() {
        console.log(this.state);
        if (this.state.$curPage.hasClass('dark')) {
          $('#wrapper').addClass('darkSlide').removeClass('midSlide');
        } else if (this.state.$curPage.hasClass('mid')) {
          $('#wrapper').addClass('midSlide').removeClass('darkSlide');
        } else {
          $('#wrapper').removeClass('darkSlide').removeClass('midSlide');
        };
      }
    });
  };

  Portfolio.initThumbnailMode = function () {
    var _this = this;

    // build the thumbnailmode
    this.ThumbnailMode = $('.portfolio').thumbnailMode({
      $targetContainer: $('#wrapper'),
      $toggle: $('#thumbnailToggle'),
      callback: function() {
        var $selectedThumbnail = this.state.$selectedThumb;
        var pageNumber = $selectedThumbnail.attr('data-page');
        Portfolio.Carousel.showPage(pageNumber);
        this.close();
      },
      manualDestination: true,
      thumbName: 'data-thumb',
      thumbDestinationName: 'data-thumbDestination'
    });

    // when thumbnail mode opens close info;
    $(this.ThumbnailMode).on('thumbnail-mode-open', function() {
      _this.closeInfo();
    });
  };

  // apply event listeners to info toggle
  Portfolio.initInfo = function () {
    var _this = this;
    
    // apply fast click to toggle
    this.$info.fastClick(function(){
      var overlayOpen = _this.$infoOverlay.hasClass('infoOpen');
      if (overlayOpen) {
        _this.closeInfo();
      } else {
        _this.openInfo();
      }
    });

    // this.$info.on('touchmove', function(e) {
    //   e.preventDefault();
    // });
    // this.$info.on('touchend', function(e) {
    //   e.preventDefault();
    // });
    // $('.infoToggle').on('click', function(e) {
    //   e.preventDefault();
    //   e.stopPropagation();
    //   var overlayOpen = _this.$infoOverlay.hasClass('infoOpen');
    //   if (overlayOpen) {
    //     _this.closeInfo();
    //   } else {
    //     _this.openInfo();
    //   }
    // });
  };

  Portfolio.openInfo = function () {
    var _this = this;
    this.$info.addClass('close');
    this.$infoOverlay.show();
    setTimeout(function(){
      _this.$infoOverlay.addClass('infoOpen');
    }, 300);

    // close thumbnail mode if open
    this.ThumbnailMode.close();
  };

  Portfolio.closeInfo = function () {
    var _this = this;
    this.$info.removeClass('close');
    this.$infoOverlay.removeClass('infoOpen');
    setTimeout(function(){
      _this.$infoOverlay.hide();
    }, 1200);
  };

  return Portfolio;
})();