(function($)
{
  /**
   * Default settings
   */
  var settings = {
    startAt:        5,
    navSelector:    null,
    nextSelector:   null,
    itemSelector:   null,
    loaderSelector: null,
    binder:         window,
    callback:       undefined
  };
  var $tmpLoader,
      $this,
      bound = false;

  /**
   * Public methods
   */
  var methods = {
    init: function(options)
    {
      if (!this.is("ul") && !this.is("ol")) {
        $.error('jQuery.infinitescrolling :: this plugin can only be applied on a list (<ul>, <ol>)');
        return this;
      }

      settings = $.extend(settings, options);
      $this = this;

      if (settings.nextSelector === null) {
        $.error('jQuery.infinitescrolling :: Option "nextSelector" must be defined');
      }
      if (settings.nextSelector === null) {
        $.error('jQuery.infinitescrolling :: Option "itemSelector" must be defined');
      }
      if (settings.loaderSelector === null) {
        $.error('jQuery.infinitescrolling :: Option "loaderSelector" must be defined');
      }
      if (settings.navSelector === null) {
        $.error('jQuery.infinitescrolling :: Option "navSelector" must be defined');
      }

      $(settings.loaderSelector).hide();
      $(settings.navSelector).hide();
      _bind();
    },
    pause: function()
    {
      _unbind();
    },
    resume: function()
    {
      _bind();
    }
  };

  /**
   * Private methods
   */
  function _bind()
  {
    if (!bound) {
      $(settings.binder).bind(
        "smartscroll.infinitescrolling",
        function() {
          _onScroll($this);
        }
      );

      bound = true;
    }
  }
  function _unbind()
  {
    if (bound) {
      $(settings.binder).unbind("smartscroll.infinitescrolling");

      bound = false;
    }
  }
  function _onScroll($this)
  {
    belowViewport = 0;

    $(settings.itemSelector).each(function()
    {
      if (_belowViewport(this)) {
        belowViewport += 1;
      }
    });

    if (belowViewport <= settings.startAt) {
      _loadNextPage($this);
    }
  }

  function _belowViewport(element)
  {
    var fold = $(window).height() + $(window).scrollTop();
    return fold <= $(element).offset().top;
  }

  function _loadNextPage($this)
  {
    var nextUrl = $(settings.nextSelector).attr("href");

    $.ajax({
      url:      nextUrl,
      dataType: "html",
      success:  function(data)
      {
        $(data).find(settings.itemSelector).each(function()
        {
          $this.append(this);
        });
      },
      beforeSend: function()
      {
        $tmpLoader = $(settings.loaderSelector).clone();
        $this.after($tmpLoader);
        $tmpLoader.show();
        _unbind();
      },
      complete: function()
      {
        $tmpLoader.remove();
        if (settings.callback !== undefined) {
          settings.callback();
        }
        _bind();
      }
    });
  }

  $.fn.infinitescrolling = function(method)
  {
    if (methods[method]) {
      methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      methods.init.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not exist on jQuery.infinitescrolling');
    }

    return this;
  };

  /**
   * smartscroll: debounced scroll event for jQuery
   * https://github.com/lukeshumard/smartscroll
   * based on smartresize by @louis_remi: https://github.com/lrbabe/jquery.smartresize.js
   * Copyright 2011 Louis-Remi & lukeshumard * Licensed under the MIT license.
   */
  var event = $.event,
    scrollTimeout;

  event.special.smartscroll = {
    setup: function() {
      $(this).bind( "scroll", event.special.smartscroll.handler );
    },
    teardown: function() {
      $(this).unbind( "scroll", event.special.smartscroll.handler );
    },
    handler: function( event, execAsap ) {
      // Save the context
      var context = this,
          args = arguments;

      // set correct event type
      event.type = "smartscroll";

      if (scrollTimeout) { clearTimeout(scrollTimeout); }
      scrollTimeout = setTimeout(function() {
        jQuery.event.handle.apply( context, args );
      }, execAsap === "execAsap"? 0 : 100);
    }
  };

  $.fn.smartscroll = function( fn ) {
    return fn ? this.bind( "smartscroll", fn ) : this.trigger( "smartscroll", ["execAsap"] );
  };
})(jQuery);