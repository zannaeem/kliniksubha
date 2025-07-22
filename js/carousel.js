$(document).ready(function() {
    console.log('Document ready - Initializing carousel...');
    
    // Check if Owl Carousel CSS is loaded
    const owlStylesLoaded = Array.from(document.styleSheets).some(sheet => 
        sheet.href && sheet.href.includes('owl.carousel')
    );
    
    if (!owlStylesLoaded) {
        console.error('Owl Carousel CSS is not loaded properly');
        return;
    }

    // Check if jQuery and Owl Carousel plugin are available
    if (typeof $.fn.owlCarousel === 'undefined') {
        console.error('Owl Carousel plugin is not loaded properly');
        return;
    }

    // Check if carousel element exists
    if ($('.service-carousel').length === 0) {
        console.error('Service carousel element not found in the DOM');
        return;
    }
    
    try {
        // Initialize Service Carousel with debugging
        var $serviceCarousel = $('.service-carousel').owlCarousel({
            loop: true,
            margin: 20,
            nav: false,
            dots: false,
            autoplay: true,
            autoplayTimeout: 5000,
            autoplayHoverPause: true,
            responsive: {
                0: {
                    items: 1
                },
                576: {
                    items: 2
                },
                768: {
                    items: 3
                },
                992: {
                    items: 4
                }
            },
            onInitialized: function(event) {
                console.log('Carousel initialized successfully');
                console.log('Total items:', event.item.count);
                
                // Check if images are loaded
                $('.service-carousel .owl-item img').each(function() {
                    if (!this.complete || this.naturalWidth === 0) {
                        console.warn('Some carousel images are not loaded properly');
                    }
                });
            },
            onInitializeFailed: function(event) {
                console.error('Carousel initialization failed', event);
            }
        });

        // Custom navigation buttons
        $('#service-prev').click(function() {
            console.log('Previous button clicked');
            $serviceCarousel.trigger('prev.owl.carousel');
        });
        
        $('#service-next').click(function() {
            console.log('Next button clicked');
            $serviceCarousel.trigger('next.owl.carousel');
        });

        // Add resize handler to refresh carousel on window resize
        let resizeTimer;
        $(window).on('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                $serviceCarousel.trigger('refresh.owl.carousel');
            }, 250);
        });

        console.log('Carousel setup completed');
    } catch (error) {
        console.error('Error initializing carousel:', error);
    }
}); 