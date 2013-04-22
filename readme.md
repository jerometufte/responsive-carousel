## Responsive Carousel

This plugin creates a carousel out of a `<ul>` element that can be animated with mouse, touch, or keyboard. It supports minimal configuration including direction, arrows, pagination elements, and page change callback.

## How To

#### deploying
To use call `$('PARENT_ELEMENT').responsiveCarousel();` on an element that parents the list you want to form the carousel.
- `PARENT_ELEMENT` should be an element with child `.rcWrapper` which wraps the `ul`.

#### Options
You may pass an object literal containing config options as an argument.
- direction: 'horizontal' or 'vertical'
- transitionSpeed: a number in milliseconds for the standard page change animation duration
- keyControl: true/false whether to allow keyboard control
- arrows: true/false whether to build/show arrows
- pagination: true false whether to populate pagination elements
- paginationEl: 'class_name' for parent of pagination elements if using pagination
- tapToReturn: true/false whether to build a tap to return element on last page
- callback: define a function to be called on every page change event, the scope of that function will have access to the pagination object and it's state etc...

#### Arrows
First looks to see if you've added two elements with class '.rcL' and '.rcR', and adds if needed. These will control the pagination. The plugin will also add class `.rcHide` to the left/top arrow on the first page, and to the right/bottom arrow on the last page. The class is changed on page change. This can allow you to hide the arrow if wanted with css.

#### Pagination
If you use pagination, the plugin will add class `rcPaginationHot` to the current pagination list element on page change. This allows you to style the current page in the list with css.

#### Callback
The callback function has access to the carousel object. This means you can use `this.state` to alter the carousel's style on every page change event. You can, for example check if the current slide is dark and change the arrows or pagination color accordingly.

#### Returns
The function returns the carousel object because I prefer to have access to the object rather than having the ability to chain jQuery methods when calling. That would be easy to switch tho.

## License
This content is released under the [MIT License](http://www.opensource.org/licenses/mit-license.php "MIT License") (MIT).