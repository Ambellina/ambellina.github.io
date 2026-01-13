/**
 * Main JS file for Subtle behaviours
 */

/*globals jQuery, document */
(function ($) {
	"use strict";

	$(document).ready(function(){

		// Responsive video embeds
		$('.post-content').fitVids();

		// Scroll to content
		$('.cover .arrow-down').on('click', function(e) {
			$('html, body').animate({'scrollTop': $('.cover').height()}, 800);
			e.preventDefault();
		});

		// Animated Back To Top link
		$('.site-footer .arrow-up').on('click', function(e) {
			$('html, body').animate({'scrollTop': 0});
			e.preventDefault();
		});

		// Sidebar
		$('.sidebar-toggle').on('click', function(e){
			$('body').toggleClass('sidebar-opened');
			e.preventDefault();
		});

		// Show comments
		$('.comments-title').on('click', function() {
			var disqus_shortname = 'my_disqus_shortname'; // replace my_disqus_shortname with your shortname

			// Load the disqus javascript
			$.ajax({
				type: "GET",
				url: "//" + disqus_shortname + ".disqus.com/embed.js",
				dataType: "script",
				cache: true
			});
			$(this).off('click').addClass('comments-loaded');
		});

		// Lightbox functionality
		var lightboxHTML = '<div class="lightbox-overlay">' +
			'<button class="lightbox-close" aria-label="Close">' +
			'<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">' +
			'<path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
			'</svg>' +
			'</button>' +
			'<button class="lightbox-nav lightbox-prev" aria-label="Previous image">' +
			'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
			'<path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
			'</svg>' +
			'</button>' +
			'<button class="lightbox-nav lightbox-next" aria-label="Next image">' +
			'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
			'<path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
			'</svg>' +
			'</button>' +
			'<div class="lightbox-content">' +
			'<img class="lightbox-image" src="" alt="">' +
			'<div class="lightbox-caption"></div>' +
			'</div>' +
			'</div>';

		$('body').append(lightboxHTML);

		var $lightbox = $('.lightbox-overlay');
		var $lightboxImg = $('.lightbox-image');
		var $lightboxCaption = $('.lightbox-caption');
		var $lightboxPrev = $('.lightbox-prev');
		var $lightboxNext = $('.lightbox-next');

		// Gallery state
		var currentGallery = [];
		var currentIndex = 0;

		function showImage(index) {
			if (index < 0 || index >= currentGallery.length) return;
			currentIndex = index;

			var $img = currentGallery[index];
			var imgSrc = $img.attr('src');
			var imgAlt = $img.attr('alt');
			var caption = $img.closest('.kg-image-card').find('figcaption').text();

			$lightboxImg.attr('src', imgSrc).attr('alt', imgAlt);
			if (caption) {
				$lightboxCaption.text(caption).show();
			} else {
				$lightboxCaption.hide();
			}

			// Update nav button visibility
			if (currentGallery.length > 1) {
				$lightboxPrev.toggle(currentIndex > 0);
				$lightboxNext.toggle(currentIndex < currentGallery.length - 1);
			} else {
				$lightboxPrev.hide();
				$lightboxNext.hide();
			}
		}

		// Click on images to open lightbox
		$(document).on('click', '.kg-image-card img', function(e) {
			e.preventDefault();
			var $clickedImg = $(this);

			// Check if image is inside a gallery container
			var $gallery = $clickedImg.closest('[data-gallery]');
			if ($gallery.length) {
				// Build gallery array from all images in this gallery
				currentGallery = [];
				$gallery.find('.kg-image-card img').each(function() {
					currentGallery.push($(this));
				});
				// Find index of clicked image
				currentIndex = currentGallery.findIndex(function($img) {
					return $img[0] === $clickedImg[0];
				});
			} else {
				// Single image, no gallery navigation
				currentGallery = [$clickedImg];
				currentIndex = 0;
			}

			showImage(currentIndex);

			$lightbox.fadeIn(300, function() {
				$(this).addClass('active');
			});
		});

		// Navigation button clicks
		$lightboxPrev.on('click', function(e) {
			e.stopPropagation();
			if (currentIndex > 0) {
				showImage(currentIndex - 1);
			}
		});

		$lightboxNext.on('click', function(e) {
			e.stopPropagation();
			if (currentIndex < currentGallery.length - 1) {
				showImage(currentIndex + 1);
			}
		});

		// Close lightbox on clicking overlay or close button
		$lightbox.on('click', function(e) {
			if (e.target === this || $(e.target).hasClass('lightbox-close') || $(e.target).closest('.lightbox-close').length) {
				$lightbox.removeClass('active');
				setTimeout(function() {
					$lightbox.fadeOut(300);
				}, 300);
			}
		});

		// Keyboard navigation
		$(document).on('keydown', function(e) {
			if (!$lightbox.hasClass('active')) return;

			// Escape to close
			if (e.keyCode === 27) {
				$lightbox.removeClass('active');
				setTimeout(function() {
					$lightbox.fadeOut(300);
				}, 300);
			}
			// Left arrow - previous image
			else if (e.keyCode === 37 && currentIndex > 0) {
				showImage(currentIndex - 1);
			}
			// Right arrow - next image
			else if (e.keyCode === 39 && currentIndex < currentGallery.length - 1) {
				showImage(currentIndex + 1);
			}
		});

		// Swipe navigation for posts on mobile
		var touchStartX = 0;
		var touchEndX = 0;
		var touchStartY = 0;
		var touchEndY = 0;
		var minSwipeDistance = 50; // minimum distance for a swipe

		var $postHeader = $('.post-template .cover');

		if ($postHeader.length) {
			$postHeader.on('touchstart', function(e) {
				touchStartX = e.originalEvent.touches[0].clientX;
				touchStartY = e.originalEvent.touches[0].clientY;
			});

			$postHeader.on('touchend', function(e) {
				touchEndX = e.originalEvent.changedTouches[0].clientX;
				touchEndY = e.originalEvent.changedTouches[0].clientY;

				var deltaX = touchEndX - touchStartX;
				var deltaY = touchEndY - touchStartY;

				// Check if horizontal swipe is more dominant than vertical
				if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
					// Swipe right - go to previous post
					if (deltaX > 0) {
						var $prevLink = $('.header-nav-arrow.arrow-left');
						if ($prevLink.length) {
							window.location.href = $prevLink.attr('href');
						}
					}
					// Swipe left - go to next post
					else {
						var $nextLink = $('.header-nav-arrow.arrow-right');
						if ($nextLink.length) {
							window.location.href = $nextLink.attr('href');
						}
					}
				}
			});
		}

		// Footnote linking
		$('.post-content sup').each(function() {
			var $sup = $(this);
			var footnoteNum = $sup.text().trim();

			// Wrap superscript in a link that points to the footnote
			var $link = $('<a></a>')
				.attr('href', '#fn' + footnoteNum)
				.attr('id', 'fnref' + footnoteNum)
				.attr('class', 'footnote-ref')
				.html($sup.html());

			$sup.replaceWith($link);
		});

		// Find footnotes and make them link back
		// Look for paragraphs that contain footnote patterns
		$('.post-content p').each(function() {
			var $p = $(this);
			var html = $p.html();

			// Match patterns like "1 - text" or "1- text" at start or after <br>
			var regex = /(?:^|(<br\s*\/?>))(\d+)\s*-\s*/gi;
			var hasFootnotes = regex.test(html);

			if (hasFootnotes) {
				// Reset regex
				regex.lastIndex = 0;

				// Replace all footnote numbers with linked versions
				var newHtml = html.replace(/(?:^|(<br\s*\/?>))(\d+)\s*-\s*/gi, function(_match, br, num) {
					var brTag = br || '';
					return brTag + '<span id="fn' + num + '" class="footnote-anchor"></span>' +
						'<a href="#fnref' + num + '" class="footnote-backref">' + num + '</a> - ';
				});

				$p.html(newHtml);
			}
		});

	});

}(jQuery));
