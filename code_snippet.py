// customize
var carousel = $('#wrapper').responsiveCarousel({
  direction: 'horizontal',
  transitionSpeed: 500,
  keyControl: true,
  arrows: true,
  pagination: true,
  paginationEl: 'paginationList',
  tapToReturn: true,
  callback: function()
    console.log(this.state);
  }
});