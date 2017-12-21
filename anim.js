/**
 * Class for performing animation based on the scroll position:
 *  - detect what element is currently at the center of viewport
 *  - add label of this element to the main wrapper
 *  - next, you free to add any magic with CSS
 *
 * @author Petr Savchenko (http://github.com/neSpecc)
 */
var anim = function (anim) {

	'use strict';

	/**
	 * Application nodes
	 * @type {Object}
	 */
	var nodes = {
		app: null,
		items: null // items for which we should detect onscreen-visibility
	};

	/**
	 * Debounce for scroll handling optimization
	 */
	var scrollDebounce;
	var resizeDebounce;

	/**
	 * Cache for viewport inner height
	 */
	var viewportHeight;


	/**
	 * @param  {String} appSelector - items holder selector
	 * @param  {String} itemSelector - items in app selector
	 */
	anim.init = function (appSelector, itemSelector) {

		nodes.app = document.querySelector(appSelector);
		nodes.items = nodes.app.querySelectorAll(itemSelector);

		viewportHeight = window.innerHeight;

		window.addEventListener('scroll', scroll);
		window.addEventListener('resize', resize);

		setTimeout(function() {
			processVisibleChapter();
		}, 100);

	}

	/**
	 * Current chapter stores in the app data-chapter
	 * @param {String} label - chapter label
	 */
	function setChapter(label) {

		let currentChapter = nodes.app.getAttribute('data-chapter');

		if (currentChapter && currentChapter === label) {
			return;
		}

		nodes.app.removeAttribute('data-chapter');
		nodes.app.setAttribute('data-chapter', label);
	}

	function scroll (event) {

		if (scrollDebounce) {
			window.clearTimeout(scrollDebounce);
		}

		scrollDebounce = setTimeout(function() {
			scrollFinished(event);
		}, 30);
	}

	function scrollFinished(event) {
		processVisibleChapter();
	}

	function resize (event) {

		if (resizeDebounce) {
			window.clearTimeout(resizeDebounce);
		}

		resizeDebounce = setTimeout(function() {
			resizeFinished(event);
		}, 30);
	}

	function resizeFinished(event) {
		viewportHeight = window.innerHeight;

		console.log('Viewport height updated: %o', viewportHeight)

		processVisibleChapter();

	}

	/**
	 * Find visible chapter and add modificator to the wrapper
	 */
	function processVisibleChapter() {
		let newVisibleChapter = findVisibleChapter();

		if (newVisibleChapter) {
			let label = newVisibleChapter.dataset.label;

			setChapter(label);
		}
	}

	/**
	* @return {Element} - chapter visible on screen
	*/
	function findVisibleChapter() {

        for (var i = 0, chapter; !!(chapter = nodes.items[i]); i++) {
            var pos = chapter.getBoundingClientRect().top;

            // if an element is more or less in the middle of the viewport

            var topY = viewportHeight/3.8,
            	botY = viewportHeight/1.05;

            if ( pos > topY && pos < botY ){
                return chapter;
            }
        }

	}

	return anim;
}({});