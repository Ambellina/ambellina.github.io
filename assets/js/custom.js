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
			'<button class="lightbox-nav lightbox-prev" aria-label="Previous">' +
			'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
			'<path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
			'</svg>' +
			'</button>' +
			'<button class="lightbox-nav lightbox-next" aria-label="Next">' +
			'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
			'<path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
			'</svg>' +
			'</button>' +
			'<div class="lightbox-content">' +
			'<img class="lightbox-image" src="" alt="">' +
			'<video class="lightbox-video" controls playsinline></video>' +
			'<div class="lightbox-caption"></div>' +
			'</div>' +
			'</div>';

		$('body').append(lightboxHTML);

		var $lightbox = $('.lightbox-overlay');
		var $lightboxImg = $('.lightbox-image');
		var $lightboxVideo = $('.lightbox-video');
		var $lightboxCaption = $('.lightbox-caption');
		var $lightboxPrev = $('.lightbox-prev');
		var $lightboxNext = $('.lightbox-next');

		// Gallery state
		var currentGallery = [];
		var currentIndex = 0;

		function pauseVideo() {
			var video = $lightboxVideo[0];
			if (video) {
				video.pause();
				video.currentTime = 0;
			}
		}

		function showMedia(index) {
			if (index < 0 || index >= currentGallery.length) return;

			// Pause any currently playing video before switching
			pauseVideo();

			currentIndex = index;

			var item = currentGallery[index];
			var caption = item.$element.closest('.kg-image-card').find('figcaption').text();

			if (item.type === 'video') {
				// Show video, hide image
				$lightboxImg.hide();
				$lightboxVideo.show();
				$lightboxVideo.attr('src', item.src);
				$lightboxVideo[0].load();
			} else {
				// Show image, hide video
				$lightboxVideo.hide();
				$lightboxImg.show();
				$lightboxImg.attr('src', item.src).attr('alt', item.alt || '');
			}

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

		// Click on images or videos to open lightbox
		$(document).on('click', '.kg-image-card:not(.kg-no-gallery) img', function(e) {
			e.preventDefault();
			var $clicked = $(this);
			var isVideo = $clicked.is('video');

			// Check if media is inside a gallery container
			var $gallery = $clicked.closest('[data-gallery]');
			if ($gallery.length) {
				// Build gallery array from all images and videos in this gallery
				currentGallery = [];
				$gallery.find('.kg-image-card:not(.kg-no-gallery) img').each(function() {
					var $el = $(this);
					var elIsVideo = $el.is('video');
					currentGallery.push({
						$element: $el,
						type: elIsVideo ? 'video' : 'image',
						src: elIsVideo ? ($el.find('source').attr('src') || $el.attr('src')) : $el.attr('src'),
						alt: elIsVideo ? '' : $el.attr('alt')
					});
				});
				// Find index of clicked media
				currentIndex = currentGallery.findIndex(function(item) {
					return item.$element[0] === $clicked[0];
				});
			} else {
				// Single media, no gallery navigation
				currentGallery = [{
					$element: $clicked,
					type: isVideo ? 'video' : 'image',
					src: isVideo ? ($clicked.find('source').attr('src') || $clicked.attr('src')) : $clicked.attr('src'),
					alt: isVideo ? '' : $clicked.attr('alt')
				}];
				currentIndex = 0;
			}

			showMedia(currentIndex);

			$lightbox.fadeIn(300, function() {
				$(this).addClass('active');
			});
		});

		// Navigation button clicks
		$lightboxPrev.on('click', function(e) {
			e.stopPropagation();
			if (currentIndex > 0) {
				showMedia(currentIndex - 1);
			}
		});

		$lightboxNext.on('click', function(e) {
			e.stopPropagation();
			if (currentIndex < currentGallery.length - 1) {
				showMedia(currentIndex + 1);
			}
		});

		function closeLightbox() {
			pauseVideo();
			$lightbox.removeClass('active');
			setTimeout(function() {
				$lightbox.fadeOut(300);
			}, 300);
		}

		// Close lightbox on clicking overlay or close button
		$lightbox.on('click', function(e) {
			if (e.target === this || $(e.target).hasClass('lightbox-close') || $(e.target).closest('.lightbox-close').length) {
				closeLightbox();
			}
		});

		// Keyboard navigation
		$(document).on('keydown', function(e) {
			if (!$lightbox.hasClass('active')) return;

			// Escape to close
			if (e.keyCode === 27) {
				closeLightbox();
			}
			// Left arrow - previous
			else if (e.keyCode === 37 && currentIndex > 0) {
				showMedia(currentIndex - 1);
			}
			// Right arrow - next
			else if (e.keyCode === 39 && currentIndex < currentGallery.length - 1) {
				showMedia(currentIndex + 1);
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

		// Mobile gallery height adjustment
		function adjustMobileGalleries() {
			var isMobile = $(window).width() <= 640;

			$('[data-gallery]').each(function() {
				var $gallery = $(this);
				var $figures = $gallery.find('.kg-image-inline');

				if (!isMobile || $figures.length <= 1 || $gallery.is('[data-vertical]')) {
					$gallery.removeClass('gallery-fitted').css('height', '');
					return;
				}

				var galleryWidth = $gallery.width();
				var itemWidth = galleryWidth * 0.85;
				var minHeight = Infinity;

				$figures.find('img').each(function() {
					if (this.naturalWidth > 0 && this.naturalHeight > 0) {
						var scaledHeight = (this.naturalHeight / this.naturalWidth) * itemWidth;
						minHeight = Math.min(minHeight, scaledHeight);
					}
				});

				if (minHeight > 0 && minHeight !== Infinity) {
					// Set figure widths first so captions wrap at their final width
					$gallery.addClass('gallery-fitted');
					$figures.each(function() {
						var img = $(this).find('img')[0];
						if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
							var figWidth = (img.naturalWidth / img.naturalHeight) * minHeight;
							this.style.setProperty('--item-w', Math.round(figWidth) + 'px');
						}
					});

					// Force reflow so captions reflow at the new widths
					$gallery[0].offsetHeight;

					// Now measure captions at their final width
					var maxCaptionHeight = 0;
					$figures.find('.caption-text').each(function() {
						maxCaptionHeight = Math.max(maxCaptionHeight, $(this).outerHeight(true));
					});

					$gallery.css('height', Math.round(minHeight + maxCaptionHeight) + 'px');

					if (maxCaptionHeight > 0) {
						$gallery[0].style.setProperty('--caption-h', maxCaptionHeight + 'px');
					} else {
						$gallery[0].style.removeProperty('--caption-h');
					}
				}
			});
		}

		$(window).on('load', adjustMobileGalleries);

		var galleryResizeTimer;
		$(window).on('resize', function() {
			clearTimeout(galleryResizeTimer);
			galleryResizeTimer = setTimeout(adjustMobileGalleries, 250);
		});

	});

}(jQuery));
