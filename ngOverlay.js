;(function ($, window, document, undefined) {
  'use strict';

  angular.module('ngOverlay', [])
    .provider('ngOverlayConfig', ngOverlayConfigProvider)
    .factory('ngOverlay', ngOverlay);

  var $overlay;

  function ngOverlayConfigProvider() {
    this.config = {
      blurLevel: 5,
      overlayClass: 'ng-overlay',
      targetSelector: '#content',
      color: '#333',
      offset: 95
    };

    this.setBlurLevel = function (_blur_level) {
      this.config.overlayClass = parseInt(_blur_level, 10);
      return this;
    };

    this.setCssClassPrefix = function (_class) {
      this.config.overlayClass = _class;
      return this;
    };

    this.setTarget = function (_selector) {
      this.config.target = _selector;
      return this;
    };

    this.setOffset = function (_offset) {
      this.config.offset = parseInt(_offset, 10);
      return this;
    };

    this.$get = function () {
      return this;
    };
  }

  ngOverlay.$inject = ['$rootScope', 'ngOverlayConfig'];

  function ngOverlay($rootScope, ngOverlayConfig) {


    return {
      firstOrCreate: firstOrCreate,
      attachCloseCallback: attachCloseCallback,
      destroy: destroy
    };

    function firstOrCreate(targetSelector, data) {
      var targetSelector = targetSelector || ngOverlayConfig.config.targetSelector;
      var scrollTop = 0;
      var not_attached = false;
      var color;

      var offset = ngOverlayConfig.config.offset;

      if(typeof data != "undefined" && data.offset){
        offset = data.offset;
      }

      var $overlay = $overlay || $('body > .' + ngOverlayConfig.config.overlayClass).length > 0 && $('body > .' + ngOverlayConfig.config.overlayClass) ||
        (not_attached = true, color = hexToRgb(ngOverlayConfig.config.color), $(document.createElement('div')).addClass(ngOverlayConfig.config.overlayClass).css({
          backgroundColor: 'rgba(' + color + ', .5)',
          zIndex: 10,
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }));
      if (not_attached) {
        scrollTop = $(window).scrollTop();
        $(targetSelector).css({
          transition: '-webkit-filter 600ms linear',
          '-webkit-filter': 'blur(' + ngOverlayConfig.config.blurLevel + 'px)'
        });
        $overlay.hide().appendTo('body').fadeIn('slow', function () {
          $(targetSelector).css({
            position: 'fixed',
            top: -(scrollTop - offset) + 'px',
            width: '100%'
          });
        });
        $rootScope.scrollTop = scrollTop;
      }
    }

    function attachCloseCallback(cb, $scope) {
      if (typeof cb === 'function' && $scope) {
        $overlay = $overlay || $('body > .' + ngOverlayConfig.config.overlayClass);
        if ($overlay.length > 0) {
          $overlay.on('click.ngOverlay', function () {
            cb();
            destroy();
          });
          $scope.$on('$destroy', function () {
            $overlay.off('click.ngOverlay');
          });
        }
      }
    }

    function destroy(targetSelector) {
      var targetSelector = targetSelector || ngOverlayConfig.config.targetSelector;
      var $content = $(targetSelector);
      var scrollTop = $rootScope.scrollTop || 0;
      $overlay = $overlay || $('body > .' + ngOverlayConfig.config.overlayClass);
      if ($overlay.length > 0) {
        $overlay.off('click.ngOverlay');
        if ($rootScope.hasOwnProperty('ngScopeBinding')) {
          delete $rootScope.ngScopeBinding;
        }
        $content.css({
          '-webkit-filter': ''
        });
        $overlay.fadeOut('slow', function () {
          $overlay.remove();
          $overlay = undefined;
          var diff = scrollTop;
          $content.css({
            transition: '',
            position: '',
            top: '',
            width: ''
          });
          $(window).scrollTop(diff);
        })
      } else {
        $overlay = undefined;
      }
    }

    function hexToRgb(hex) {
      if (hex.toString().indexOf(',') !== -1) return hex;

      var shortHandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shortHandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
      });

      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) : hex;
    }

    function rgbToHex(rgb) {
      if (rgb.toString().indexOf(',') === -1) return rgb;
      var temp = rgb.split(',');
      var r = temp[0];
      var g = temp[1];
      var b = temp[2];
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
  }


})(jQuery, window, document, undefined);
