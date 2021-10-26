(function ($) {
    var halo = {
        initPoliciesSlider: function () {
            var policyBlock = $('[data-top-message-slide]');

            policyBlock.each(function () {
                var self = $(this),
                    rows = self.data('row');

                if (self.not('.slick-initialized')) {
                    self.slick({
                        slidesToShow: rows,
                        slidesToScroll: 1,
                        vertical: true,
                        autoplay: true,
                        dots: false,
                        speed: 800,
                        get nextArrow() {
                            return this.nextArrow = '<button type="button" class="slick-next"><svg viewBox="0 0 478.448 478.448" class="icon icon-chevron-right" id="icon-chevron-right"><g><g><polygon points="131.659,0 100.494,32.035 313.804,239.232 100.494,446.373 131.65,478.448 377.954,239.232"></polygon></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg></button>';
                        },
                        get prevArrow() {
                            return this.prevArrow = '<button type="button" class="slick-prev"><svg viewBox="0 0 370.814 370.814" class="icon icon-chevron-left" id="icon-chevron-left"><g><g><polygon points="292.92,24.848 268.781,0 77.895,185.401 268.781,370.814 292.92,345.961 127.638,185.401"></polygon></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg></button>';
                        },
                    });
                }
            });
        }
    }
    halo.initPoliciesSlider();
})(jQuery);
