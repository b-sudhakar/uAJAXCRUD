;
$(function () {
    $(".dropdown").hover(
            function () {
                $('.dropdown-menu', this).stop(true, true).fadeIn("fast");
                $(this).toggleClass('open');
                $('b', this).toggleClass("caret caret-up");
            },
            function () {
                $('.dropdown-menu', this).stop(true, true).fadeOut("fast");
                $(this).toggleClass('open');
                $('b', this).toggleClass("caret caret-up");
            });
        });

function setupCRUD($) {

    var log = function (s) {
        console.log(s);
    };

    $(document).ajaxError(function (e, xhr) {

        var getBaseUrl = function () {
            var re = new RegExp(/^.*\//);
            return re.exec(window.location.href);
        };

        // a try/catch is recommended as the error handler
        // could occur in many events and there might not be
        // a JSON response from the server
        try {
            var json = $.parseJSON(xhr.responseText);
            if (json.error == 401) {

                //refresh present url
                window.location.href = window.location.href;
            }
        } catch (e) {
        }

    });

    $.fn.bindAjaxDropdown = function (api, $target) {

        $(this).change(function () {

            var url = api + '/' + $(this).val();

            $target.empty().append('<option>Loading ...</option>');
            $.get(url, function (data, textStatus) {
                if (data) {
                    $target.empty();
                    $(data).each(function () {
                        $target.append($('<option></option>').attr('value', this.Value).text(this.Text));
                    });
                }
            }, 'json');

        });

        if (!$(this).val())
            $target.change();
    };

    $.fn.uAjaxCRUD = function () {

        var theThis = this;

        var getAjaxModeUrl = function (uri) {
            if (!uri)
                uri = window.location.href;

            var i = uri.indexOf('?');

            //console.log('Url ' + uri + ', i pos ' + i);
            if (i != -1)
                return uri + '&uim=a';
            return uri + '?uim=a';
        };

        var valignModel = function ($div) {
            var wWidth = $(window).width(); var wHeight = $(window).height();
            //$(div).fadeIn();

            var divWidth = $('.edit-body', $div).width();
            log('modal div width ' + divWidth);

            if (divWidth > 600)
                $('.modal-dialog ', $div).addClass('modal-lg');
            else
                $('.modal-dialog ', $div).removeClass('modal-lg');


            //$div.css({ left: (wWidth / 2) - ($div.width() / 2), top: (wHeight / 2) - ($div.height() / 2) });
        }

        var refreshGrid = function ($modal) {

            var $gridForm = $('.grid-footer form', theThis);

            log('footer form ' + $gridForm[0]);

            if (!$gridForm.length) {
                $(theThis).load(getAjaxModeUrl(), function () {
                    init(theThis);
                    removeProgressModal($modal);
                });
            }
            else {
                var currPage = $('input[name="currPage"]', $gridForm).val();
                refreshGridPage(currPage, $gridForm, false, function () {
                    removeProgressModal($modal);
                });
            }
        };

        var showProgressModal = function () {
            var $div = $(document.createElement('div'));
            $div.css({ display: 'none' });
            $div.addClass('modal progress-modal');
            $div.html('<div class="ajax-modal-progress"></div>');
            $div.modal('show');
            valignModel($div);
            return $div;
        };

        var removeProgressModal = function ($modal) {
            $modal.modal('hide');
            $modal.remove();
        };

        var refreshGridPage = function (pageIndex, $form, showLoading, fnAfterGet) {
            var data = {};
            data.uim = 'a';
            var $uim = $("input[name='uim']", $form);

            if ($uim.length) {
                $uim.remove();
                log('remove uim ' + $uim.length);
            }

            var $modal;

            if (showLoading)
                $modal = showProgressModal();

            if (pageIndex)
                data['navPage'] = pageIndex;

            $form.ajaxSubmit({ data: data, success: function (response) {
                $(theThis).html(response);
                init(theThis);

                if (showLoading)
                    removeProgressModal($modal);

                if (fnAfterGet)
                    fnAfterGet();
            }
            });

        };

        var bindPager = function (theThis) {
            var $form = $('.grid-footer form', theThis);

            $form.submit(function (e) {
                refreshGridPage(null, $form, true, null);
                return false;
            });

            $('button[name="navPage"]', $form).click(function (e) {
                refreshGridPage($(this).val(), $form, true, null);
                return false;
            });

        };

        var bindForm = function ($modal) {

            $modal.removeClass('progress-modal');
            $modal.addClass('modal');
            valignModel($modal);

            //remove the popup
            $('.cancel', $modal).click(function () {
                $modal.modal('hide');
                $modal.remove();
                return false;
            });

            //remove popup with refresh
            $('.cancel-refresh', $modal).click(function () {
                //refreshGrid(modal);
                return false;
            });

            var disableModal = function () {
                var modalBack = $('<div class="modal-overlay"></div>');
                var modalPos = $modal.position();
                $(modalBack).css({ left: modalPos.left, top: modalPos.top, width: $modal.width(), height: $modal.height() });
                $modal.append(modalBack);
            };

            var form = $('form', $modal);

            form.ajaxForm({
                url: getAjaxModeUrl(form.attr('action')),
                type: form.method,
                beforeSubmit: disableModal,
                success: function (result) {
                    if (result.Success) {
                        refreshGrid($modal);
                    } else {
                        $modal.html('<div class="modal-dialog"><div class="modal-content">' + result + '</div></div>');
                        bindForm($modal);
                    }
                }
            });
        };

        var init = function (theThis) {

            console.log('init called ');

            $('a', theThis).each(function (i, a) {
                var $a = $(a);
                var href = $(a).attr('href');
                if (href == '' || href == '#' || href == undefined) {
                    return;
                }

                if ($(a).attr('data-app') != undefined) {
                    if ($(a).attr('data-app') == 'no-popup')
                        return;
                }

                $(a).click(function () {
                    log('getting called ' + $(a).attr('href'));
                    var $div = showProgressModal();
                    $.get(getAjaxModeUrl(this.href), function (html) {
                        $div.html('<div class="modal-dialog"><div class="modal-content">' + html + '</div></div>');
                        bindForm($div);
                    });

                    return false;
                });

            });

            bindPager(theThis);
        };

        init(this);


    }
};
setupCRUD(jQuery);