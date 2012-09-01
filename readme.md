## Responsive Carousel
  
This plugin creates a carousel out of a `<ul>` element that can be animated with mouse, touch, or keyboard. It supports minimal configuration including direction, arrows, pagination elements, and page change callback.

## To deploy  
  
To use call `$('PARENT_ELEMENT').responsiveCarousel();` on an element that parents the list you want to form the carousel.  
- `PARENT_ELEMENT` should be an element with child `.rcWrapper` which wraps the `ul`.  
  
You may pass an object literal containing config options as an argument.  
- direction: 'horizontal' or 'vertical'  
- transitionSpeed: a number in milliseconds for the standard page change animation duration  
- keyControl: true/false whether to allow keyboard control  
- arrows: true/false whether to build/show arrows  
- pagination: true false whether to populate pagination elements  
- paginationEl: 'class_name' for parent of pagination elements if using pagination  
- tapToReturn: true/false whether to build a tap to return element on last page  
- callback: define a function to be called on every page change event, the scope of that function will have access to the pagination object and it's state etc...  
  