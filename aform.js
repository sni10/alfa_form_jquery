/*FORM AJAX*/
/*FORM AJAX*/
/*FORM AJAX*/
/*FORM AJAX*/
/*FORM AJAX*/
/*FORM AJAX*/
/*FORM AJAX*/
var progressFiles = [];
function validateError(fname, data) {

    var num = 0;
    var first;

    if (data.reloadpage) {
        var to = 500;
        if (data.reloadpageTO) {
            to = parseInt(data.reloadpageTO);
        }
        setTimeout(function () {
            window.location.reload();
        }, to);
    }

    if (data.closeprevpopup) {
        $('.closeIcon').click(  );
    }

    $.each(data, function (index, value) {

        if (index == 'popup') {
            popupOpen(value);
            if (data.closethispopup) {
                var to = 500;
                if (data.closethispopupTO) {
                    to = parseInt(data.closethispopupTO);
                }
                setTimeout(function () {
                    $('.closeIcon').click();
                }, to);
            }
        } else if (index == 'redirect') {
            var to = 500;

            if (typeof(data.redirectTO) == 'number') {
                to = parseInt(data.redirectTO);
            }

            setTimeout(function () {
                window.location.href = value;
                if (value.indexOf('#') != -1 || value == 'reload') {
                    window.location.reload();
                }
            }, to);

            $('form[name="' + fname + '"].submitted').addClass('blocked');

        } else {
            var targ = $('form[name="' + fname + '"].submitted *[get="' + index + '"]');

            var gform = $('form[name="' + fname + '"].submitted');

            if (targ.length) {
                targ.addClass('ferror');
                if (targ.parents('.form-group').length) {
                    targ.parents('.form-group').addClass('has-error');
                }
            }

            if ( $('form[name="' + fname + '"].submitted .input_error[get="err_' + index + '"]').length ) {
                var val = [];
                $.each(value, function (i, v) {
                    if ($.inArray('<div>' + v + '</div>', val) == -1) {
                        val.push('<div>' + v + '</div>');
                    }
                });
                $('form[name="' + fname + '"].submitted .input_error[get="err_' + index + '"]').html('');
                if (!first) first = index;
                $('form[name="' + fname + '"].submitted .input_error[get="err_' + index + '"]').html(val.join('')).slideDown(function () {
                    if ( index == first && !$('.popup_wrap:visible').length && !$('.jconfirm:visible').length && !$('form[name="' + fname + '"].submitted *[get="' + index + '"]').hasClass('noslide')) {
                        var targ = $(this).parents('form').find('*[get="' + index + '"]');
                        if (!targ.length) {
                            targ = $(this).parents('form').find('*[get="err_' + index + '"]');
                        }
                        if (targ.length) {
                            slideToPos(targ.offset().top - 170);
                        }
                    }
                });
                num++;
                $(window).resize();
            }

            var gdata = gform.data();
            if( typeof gdata !== "undefined")  {
                grecaptcha.reset( gdata.g );
            }
        }
    });

    return num;
}
function hideError(el) {
    var sp = 400;
    if ($(el).hasClass('input_error')) {
        $(el).next().focus();
        $(el).stop(true, true).slideUp(sp, function () {
            $(window).resize();
        });
    }
    else {
        if ($(el).next().hasClass('input_error')) {
            $(el).next().stop(true, true).slideUp(sp, function () {
                $(window).resize();
            });
            $(el).removeClass('ferror');
            if ($(el).parents('.form-group').length) {
                $(el).parents('.form-group').removeClass('has-error');
            }
        }
    }
}

function slideToPos(e, pos) {
    $('html, body').stop(true, true).animate({scrollTop: pos});
}

function bindFormAjax() {

    $('form.ajax').each(function () {

        var form = $(this);

        form.find('input,textarea,select').each(function () {

            var input = $(this);

            if (input.attr('type') == 'hidden' && !input.hasClass('forceajax')) {
                return true;
            }

            if (input.attr('name')) {
                var get = input.attr('name').split('[');
                get = get[get.length - 1].replace(']', '');
                if (!form.find('*[get="' + get + '"]').length) {
                    input.attr('get', get);
                }
            }

        });

        form.find('input,textarea,select').each(function () {

            var input = $(this);

            if ( input.attr('type') == 'hidden' && !input.hasClass('forceajax')) {
                return true;
            }

            if ( input.attr('get') != undefined
                && (!input.prev() || !input.prev().hasClass('input_error'))
                && (!input.next() || !input.next().hasClass('input_error'))
                && ( !input.hasClass('colorPicker'))
            ) {

                input.attr('onfocus', 'hideError(this);');

                var afterer = input;

                if ( ( input.attr('type') == 'checkbox' || input.attr('type') == 'radio' ) && ( input.next().length && input.next().get(0).tagName == 'LABEL') ) {
                    afterer = input.next();
                }

                if ( ( !afterer.next() || !afterer.next().hasClass('input_error') ) ) {
                    afterer.after('<div class="input_error" onclick="hideError(this);" get="err_' + input.attr('get') + '"></div>');
                }

            }
        });
    });

    $('form.ajax:not(.binded)').each(function () {

        var form = $(this);

        form.addClass('binded');

        if (form.find('input[type="file"].autoload').length) {
            form.find('input[type="file"].autoload').change(function () {
                var inputFile = $(this);
                inputFile.parents('form').find('input[type="file"]').attr('disabled', 'disabled');
                inputFile.removeAttr('disabled');
                if (inputFile.attr('url')) {
                    inputFile.parents('form').attr('prevaction', inputFile.parents('form').attr('action'));
                    inputFile.parents('form').attr('action', inputFile.attr('url'));
                }
                if ( inputFile.attr('fname')) {
                    inputFile.parents('form').attr('prevname', inputFile.parents('form').attr('name'));
                    inputFile.parents('form').attr('name', inputFile.attr('fname'));
                }
                inputFile.addClass('autoloading');
                inputFile.parents('form').submit();
                inputFile.parents('form').find('input[type="file"]').removeAttr('disabled');
            });
        }

        if (form.find('input[type="file"]').length) {
            form.attr('enctype', 'multipart/form-data');
        }

        form.submit(function (e) {

            var form = $(this);

            if (form.hasClass('submitted') || form.hasClass('blocked')) {
                preventDefault(e);
                return false;
            }

            form.addClass('submitted');

            if (formAjaxBefore(this, e)) {

                var filesSelected = 0;
                if ( form.find('input[type="file"]').length) {
                    form.find('input[type="file"]').each(
                        function(){
                            filesSelected+=this.files.length;
                        }
                    );
                }

                if ( form.find('input[type="file"]').length && filesSelected ) {

                    var fname = $(this).attr('name');

                    var formData = new FormData();

                    $(this).find('input[type!="file"],select,textarea').each(function () {
                        // formData[$(this).attr('name')] = $(this).val() ;
                        formData.append($(this).attr('name'), $(this).val());
                    });

                    $(this).find('input[type="file"]').each(function () {
                        var status = ($(this).attr('get'))+'_status';
                        var fieldName = $(this).attr('name');
                        $.each(this.files, function (fk, fv) {

                            formData.append(fieldName, fv);

                            progressFiles.push({
                                name: fv.name,
                                size: fv.size,
                            });

                            $('.'+status).html(fv.name);

                        });
                    });

                    startProgress(progressFiles);

                    var http = new XMLHttpRequest(); // Создаем объект XHR, через который далее скинем файлы на сервер.

                    // Процесс загрузки
                    if (http.upload && http.upload.addEventListener) {

                        http.upload.addEventListener( // Создаем обработчик события в процессе загрузки.
                            'progress',
                            function(e) {
                                if (e.lengthComputable) {
                                    uploadProgress(e);
                                    // e.loaded — сколько байтов загружено.
                                    // e.total — общее количество байтов загружаемых файлов.
                                    // Кто не понял — можно сделать прогресс-бар :-)
                                }
                            },
                            false
                        );

                        http.onreadystatechange = function () {
                            // Действия после загрузки файлов
                            if (this.readyState == 4) { // Считываем только 4 результат, так как их 4 штуки и полная инфа о загрузке находится
                                if(this.status == 200) { // Если все прошло гладко
                                    // Действия после успешной загрузки.
                                    // Например, так
                                    // var result = $.parseJSON(this.response);
                                    // можно получить ответ с сервера после загрузки.
                                    var data = this.responseText;
                                    formAjaxAns(fname, data);
                                } else {
                                    // Сообщаем об ошибке загрузки либо предпринимаем меры.
                                }
                            }
                        };

                        http.upload.addEventListener(
                            'load',
                            function(e) {
                                // Событие после которого также можно сообщить о загрузке файлов.
                                // Но ответа с сервера уже не будет.
                                // Можно удалить.
                            });

                        http.upload.addEventListener(
                            'error',
                            function(e) {
                                // Паникуем, если возникла ошибка!
                                console.log( 'error');
                            });
                    }
                    http.open('POST', $(this).attr('action')); // Открываем коннект до сервера.
                    http.send(formData); // И отправляем форму, в которой наши файлы. Через XHR.
                    preventDefault(e);

                } else {
                    var fname = form.attr('name');
                    $.ajax({
                        type: form.attr('method'),
                        url: form.attr('action'),
                        data:  '_csrf=' + YII_CSRF_TOKEN + '&' + form.serialize(),
                    }).done(function (data) {
                        formAjaxAns(fname, data);
                    });
                    preventDefault(e);
                }

            } else {
                form.find('input[type="file"]').removeAttr('disabled');
                form.removeClass('submitted');
                preventDefault(e);
            }

        });
    });
    $('iframe#formajax:not(.binded)').addClass('binded').load(function () {
        formAjaxAns($(this).attr('form-name'), $(this).contents().find('body').html());
    });
}


function upload(files) {

    // Сначала мы отправим пустой запрос на сервер.
    // Это связано с тем, что иногда Safari некорректно обрабатывает
    // первый файл.

    $.get('/blank.html');

    var http = new XMLHttpRequest(); // Создаем объект XHR, через который далее скинем файлы на сервер.

    // Процесс загрузки
    if (http.upload && http.upload.addEventListener) {

        http.upload.addEventListener( // Создаем обработчик события в процессе загрузки.
            'progress',
            function(e) {
                if (e.lengthComputable) {
                    // e.loaded — сколько байтов загружено.
                    // e.total — общее количество байтов загружаемых файлов.
                    // Кто не понял — можно сделать прогресс-бар :-)
                }
            },
            false
        );

        http.onreadystatechange = function () {
            // Действия после загрузки файлов
            if (this.readyState == 4) { // Считываем только 4 результат, так как их 4 штуки и полная инфа о загрузке находится
                if(this.status == 200) { // Если все прошло гладко

                    // Действия после успешной загрузки.
                    // Например, так
                    // var result = $.parseJSON(this.response);
                    // можно получить ответ с сервера после загрузки.
                    var data = this.responseText;
                    formAjaxAns(fname, data);
                } else {
                    // Сообщаем об ошибке загрузки либо предпринимаем меры.
                }
            }
        };

        http.upload.addEventListener(
            'load',
            function(e) {
                // Событие после которого также можно сообщить о загрузке файлов.
                // Но ответа с сервера уже не будет.
                // Можно удалить.
            });

        http.upload.addEventListener(
            'error',
            function(e) {
                // Паникуем, если возникла ошибка!
            });
    }

    var form = new FormData(); // Создаем объект формы.
    form.append('path', '/'); // Определяем корневой путь.
    for (var i = 0; i < files.length; i++) {
        form.append('file[]', files[i]); // Прикрепляем к форме все загружаемые файлы.
    }
    http.open('POST', '/upload.php'); // Открываем коннект до сервера.
    http.send(form); // И отправляем форму, в которой наши файлы. Через XHR.
}


function preloader(el, r, cl) {
    if (!cl) cl = '';
    if (!r) {
        el.append('<div class="preloader_wrap ' + cl + '"><div class="preloader"></div></div>');
        el.find('.preloader_wrap,.preloader').fadeIn(200);
    }
    else {
        el.find('.preloader_wrap').fadeOut(200, function () {
            $(this).remove();
        });
    }
}

function formAjaxBefore(el, e) {
    var al = null;
    var form = $('form[name="' + $(el).attr('name') + '"].submitted');
    form.find('.ferror').removeClass('ferror');
    form.find('.has-error').removeClass('has-error');
    form.find('.input_error').each(function () {
        hideError(this);
    });

    if (form.find('.autoloading').length) {
        al = form.find('.autoloading');
    }
    switch ($(el).attr('name')) {
        case 'typical':
            preloader(form);
            break;
        case 'form-send-invite':
            preloader(form);
            break;
        case 'verification':
            preloader(form);
            break;
        case 'doreview':
            preloader(form);
            break;
        case 'doticket':
            preloader(form);
            break;
        case 'signup':
            preloader(form);
            break;
        case 'createTicketAns':
            preloader(form);
            break;
        case 'exchange-form':
            if ($('#send_approve').length) {
                $('#send_approve').addClass('submitted');
                preloader($('#send_approve'));
                $('#orders_ver_code').prop('disabled', false);
            } else {
                $('#orders_ver_code').prop('disabled', true);
            }

            if ($('#send_captcha').length) {
                $('#send_captcha').addClass('submitted');
                preloader($('#send_captcha'));
                $('#orders_captcha_code').val($('.g-recaptcha-response').val());
                $('#orders_captcha_code').prop('disabled', false);
            } else {
                $('#orders_captcha_code').prop('disabled', true);
            }

            if ($('#send_phone').length) {
                $('#send_phone').addClass('submitted');
                preloader($('#send_phone'));
                $('#data_phone').prop('disabled', false);
            } else {
                $('#data_phone').prop('disabled', true);
            }

            preloader(form);
            break;
        case 'autoexchange-create':
            preloader(form);
            break;
        case 'reserve_request':
            preloader(form);
            break;
        case 'profile-edit-form':
            preloader(form);
            break;
        case 'form-edit-account':
            preloader(form);
            break;
        case 'form-wall-message':
            preloader(form);
            break;
        case 'form-login-account':
            preloader(form);
            break;

        case 'form-signup-user':
            preloader(form);
            break;

        case 'form-signup-company':
            preloader(form);
            break;

        case 'form-signup-model':
            preloader(form);
            break;

        case 'form-signup-user-mob':
            preloader(form);
            break;

        case 'form-signup-company-mob':
            preloader(form);
            break;

        case 'form-signup-model-mob':
            preloader(form);
            break;

        case 'form-main-model':
            preloader(form);
            break;

        case 'form-figure-model':
            preloader(form);
            break;

        case 'form-about-model':
            preloader(form);
            break;

        case 'form-edit-profile':
            preloader(form);
            break;

        case 'form-detail-profile':
            preloader(form);
            break;

        case 'create-album-form':
            preloader(form);
            break;

        case 'edit-album-form':
            preloader(form);
            break;

        case 'form-account-model':
            preloader(form);
            break;

        case 'send-email-ticket':
            preloader(form);
            break;
        case 'dialog_preload_photo':
            preloader(form);
            break;
        case 'dialog_preload_video':
            preloader(form);
            break;
        case 'dialog_preload_face':
            preloader(form);
            break;
        case 'dialog_preload_passport':
            preloader(form);
            break;
        case 'dialog_preload_pass_face':
            preloader(form);
            break;
        case 'request-password-reset-form':
            preloader(form);
            break;
        case 'reset-password-form':
            preloader(form);
            break;
        case 'upload-photo-form':
            preloader(form);
            break;
        case 'model-shedule-form':
            preloader(form);
            break;
        case 'start-stream':
            preloader(form);
            break;
        case 'form-donate':
            preloader(form);
            break;
        case 'pass-change-form':
            preloader(form);
            break;
        case 'form-settings-form':
            preloader(form);
            break;
        case 'upload-video-form':
            preloader(form);
            break;
        case 'form-document-verification':
            preloader(form);
            break;
        case 'form-deactivate':
            preloader(form);
            break;
    }

    return true;
}

function formAjaxAns(fname, data) {

    closeProgress();

    var al = null;
    var form = $('form[name="' + fname + '"].submitted');

    if (typeof form.attr('prevaction') != 'undefined') {
        form.attr('action', form.attr('prevaction'));
        form.removeAttr('prevaction');
    }
    if (typeof form.attr('prevname') != 'undefined') {
        form.attr('name', form.attr('prevname'));
        form.removeAttr('prevname');
    }
    if (form.find('.autoloading').length) {
        al = form.find('.autoloading');
        al.removeClass('autoloading');
    }

    switch (fname) {
        case 'verification':
            step = parseFloat(form.find('input[name="step"]').val());
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    switch (step) {
                        case 0:
                            if (data.status == 1) {
                                initButtonTimer(form.find('.smsrequestbutton'), 60);
                                form.find('.step[data-step="0.5"]').removeClass('dni').hide().slideDown();
                                form.find('input[name="step"]').val(0.5);
                            }
                            break;
                        case 0.5:
                            if (data.status == 1) {
                                verButfunc(form.find('.smsrequestbutton'));
                                form.find('input[name="step"]').val(1);
                            }
                            break;
                        case 1:
                            if (data.status == 1) {
                                verButfunc(form.find('.vtc2'));
                                form.find('input[type="file"]').val('');
                                form.find('input[name="step"]').val(2);
                            }
                            break;
                        case 2:
                            if (data.status == 1) {
                                verButfunc(form.find('.vtc3'));
                                form.find('input[type="file"]').val('');
                                form.find('input[name="step"]').val(3);
                            }
                            break;
                    }
                } else {
                    form.find('.smsrequestbutton').removeClass('cd');
                }
            }
            preloader(form, 1);
            break;

        case 'typical':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                }
            }
            preloader(form, 1);
            break;

        case 'doreview':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    form.find('input[name="Review[text]"]').val('');
                }
            }
            preloader(form, 1);
            break;

        case 'doticket':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    form.find('textarea[name="Ticket[descr]"]').val('');
                }
            }
            preloader(form, 1);
            break;
        case 'createTicketAns':
            if (data) {
                data = JSON.parse(data);
                if (!validateError(fname, data)) {
                    form.find('textarea[name="Ticket[descr]"]').val('');
                    getTicketHistory(form.find('input[name="Ticket[parent]"]').val(), true);
                }
            }
            preloader(form, 1);
            break;


        case 'form-signup-user':



            if (data) {
                data = json(data);



                if (!validateError(fname, data)) {
                }
            }
            preloader(form, 1);
            break;

        case 'form-signup-company':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                }
            }
            preloader(form, 1);
            break;

        case 'form-signup-model':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    $('#register-model').modal('hide');
                }
            }
            preloader(form, 1);
            break;

        case 'form-signup-user-mob':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                }
            }
            preloader(form, 1);
            break;

        case 'form-signup-company-mob':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                }
            }
            preloader(form, 1);
            break;

        case 'form-signup-model-mob':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    $('#register-model').modal('hide');
                }
            }
            preloader(form, 1);
            break;

        case 'form-main-model':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);
                }
            }
            preloader(form, 1);
            break;


        case 'form-document-verification':
            if (data) {
                data = JSON.parse(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);
                    console.log('DONE!!!')
                }
            }
            preloader(form, 1);
            break;


        case 'form-figure-model':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);
                }
            }
            preloader(form, 1);
            break;

        case 'model-shedule-form':
            if (data) {
                data = JSON.parse(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);

                }
            }
            preloader(form, 1);
            break;


        case 'form-about-model':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);
                }
            }
            preloader(form, 1);
            break;


        case 'form-account-model':
            if (data) {
                data = JSON.parse(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);
                }
            }
            preloader(form, 1);
            break;



        case 'form-send-invite':
            if (data) {
                data = JSON.parse(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);
                }
            }
            preloader(form, 1);
            break;

        case 'form-edit-profile':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);
                }
            }
            preloader(form, 1);
            break;

        case 'form-detail-profile':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);
                }
            }
            preloader(form, 1);
            break;


        case 'form-deactivate':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);
                }
            }
            preloader(form, 1);
            break;

        case 'form-model-notify':
            if (data) {
                data = JSON.parse(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);
                }
            }
            preloader(form, 1);
            break;

        case 'create-album-form':
            if (data) {
                data = JSON.parse(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);
                    destroyModal()
                }
            }
            preloader(form, 1);
            break;

        case 'edit-album-form':
            if (data) {
                data = JSON.parse(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);
                    destroyModal()
                }
            }
            preloader(form, 1);
            break;


        case 'reserve_request':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {

                }
            }
            preloader(form, 1);
            break;
        case 'profile-edit-form':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);
                }
            }
            preloader(form, 1);
            break;

        case 'form-edit-account':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);
                }
            }
            preloader(form, 1);
            break;

        case 'send-email-ticket':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {

                }
            }
            preloader(form, 1);
            break;

        case 'form-login-account':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {

                }
            }
            preloader(form, 1);
            break;

        case 'upload-photo-form':
            if (data) {
                data = JSON.parse(data);
                if (!validateError(fname, data)) {
                    if (data.status == 1) {
                        replaceForms(data);
                        destroyModal()
                    }
                }
            }
            preloader(form, 1);
            break;


        case 'request-password-reset-form':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {

                }
            }
            preloader(form, 1);
            break;



        case 'reset-password-form':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {

                }
            }
            preloader(form, 1);
            break;

        case 'form-wall-message':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    $('.emoji-wysiwyg-editor').html('');
                    var dataComm = $('#comm-cnt').data();
                    var cntComment = dataComm.cnt;
                    $('#comm-cnt').html( (cntComment + 1) ).data( "cnt", (cntComment + 1) );
                    $('.s-sect-tab').prepend(data.html).show('slow');
                    $('.rateit').rateit();
                    form.find('textarea').val('');
                    $('.dialogmessinp').val('').html('');
                    $('.dialog_image_preview_wrap').html('');
                    $(".html5lightbox").html5lightbox();
                }
            }
            preloader(form, 1);
            break;

        case 'pass-change-form':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);
                }
            }
            preloader(form, 1);
            break;


        case 'form-settings-form':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);
                }
            }
            preloader(form, 1);
            break;


        case 'upload-video-form':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    replaceForms(data);
                    form.find('input[type="text"]').val('');
                    destroyModal()
                }
            }
            preloader(form, 1);
            break;

        case 'dialog_preload_face':
            if (data) {
                data = json(data);
                $('.dialog_preload_face').val('');
                if (!validateError(fname, data)) {
                    if (typeof data.original != 'undefined' && data.original.length) {
                        var tpl = $('.dialog_image_preview_tpl_face').html();
                        $.each(data.file, function (i, v) {
                            $('.dialog_image_preview_wrap_face').html(tpl);
                            var targ = $('.dialog_image_preview_wrap_face .one:first');
                            targ.find('.im').attr('src', v);
                            targ.find('.original').attr('value', data.original[i]);
                        });
                        $('.dialog_image_preview_wrap_face').next().addClass('active');
                    }
                }
            }
            preloader(form, 1);
            break;

        case 'dialog_preload_passport':
            if (data) {
                data = json(data);
                $('.dialog_preload_passport').val('');
                if (!validateError(fname, data)) {
                    if (typeof data.original != 'undefined' && data.original.length) {
                        var tpl = $('.dialog_image_preview_tpl_passport').html();
                        $.each(data.file, function (i, v) {
                            $('.dialog_image_preview_wrap_passport').html(tpl);
                            var targ = $('.dialog_image_preview_wrap_passport .one:first');
                            targ.find('.im').attr('src', v);
                            targ.find('.original').attr('value', data.original[i]);
                        });
                        $('.dialog_image_preview_wrap_passport').next().addClass('active');
                    }
                }
            }
            preloader(form, 1);
            break;

        case 'dialog_preload_pass_face':
            if (data) {
                data = json(data);
                $('.dialog_preload_pass_face').val('');
                if (!validateError(fname, data)) {
                    if (typeof data.original != 'undefined' && data.original.length) {
                        var tpl = $('.dialog_image_preview_tpl_pass_face').html();
                        $.each(data.file, function (i, v) {
                            $('.dialog_image_preview_wrap_pass_face').html(tpl);
                            var targ = $('.dialog_image_preview_wrap_pass_face .one:first');
                            targ.find('.im').attr('src', v);
                            targ.find('.original').attr('value', data.original[i]);
                        });
                        $('.dialog_image_preview_wrap_pass_face').next().addClass('active');
                    }
                }
            }
            preloader(form, 1);
            break;

        case 'dialog_preload_photo':
            if (data) {
                data = json(data);
                $('.dialog_preload_photo').val('');
                if (!validateError(fname, data)) {
                    if (typeof data.original != 'undefined' && data.original.length) {
                        var tpl = $('.dialog_image_preview_tpl').html();
                        $.each(data.file, function (i, v) {
                            $('.dialog_image_preview_wrap').prepend(tpl);
                            var targ = $('.dialog_image_preview_wrap .one:first');
                            targ.find('.im').attr('src', v);
                            targ.find('.original').attr('value', data.original[i]);
                        });
                        $('.dialog_image_preview_wrap').next().addClass('active');
                    }
                }
            }
            preloader(form, 1);
            break;

        case 'dialog_preload_video':
            if (data) {
                data = json(data);
                $('.dialog_preload_video').val('');
                $('.dialog_image_preview_wrap').html('');
                if (!validateError(fname, data)) {
                    if (typeof data.files != 'undefined' && data.files.length) {
                        var tpl = $('.dialog_image_preview_tpl').html();
                        $.each(data.files, function (i, v) {
                            $('.dialog_image_preview_wrap').prepend(tpl);
                            var targ = $('.dialog_image_preview_wrap .one:first');
                            targ.find('.data').attr('data-rand', data.data);
                            targ.find('.data').attr('value', data.data);

                            targ.find('.im').attr('data-rand', data.data);
                            targ.find('.im').attr('data-video', data.origin);
                            targ.find('.im').attr('data-value', data.screens[i]);
                            targ.find('.im').attr('src', v);

                            targ.find('.original').attr('data-value', data.screens[i]);
                            targ.find('.original').attr('value', data.screens[i]);

                            if ( i == 0 )  {
                                targ.find('.original').parent().addClass('active');
                                $('#videouploadform-cover').val(data.screens[0]);
                                $('#videouploadform-file').val(data.origin);

                            }

                        });
                    }
                }
            }
            preloader(form, 1);

            break;

        case 'dialog_inside':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    var last = $('.drp-um:last');
                    var targ = $('.drp-d-ci-user');
                    targ.append(data.mess);
                    if(last.length && !last.hasClass('answer')){
                        $('.drp-um:last').addClass('sameasprev');
                    }

                    $('.dialogmessinp').val('').html('');
                    $('.dialog_image_preview_wrap').html('');
                    $(".html5lightbox").html5lightbox();
                }
            }
            preloader(form, 1);
            break;
        case 'start-stream':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {

                }
            }
            preloader(form, 1);
            break;
        case 'form-donate':
            if (data) {
                data = json(data);
                if (!validateError(fname, data)) {
                    if(typeof(data.hash) != undefined && data.hash){
                        Chat.vent.trigger('message:send', 'gift_' + data.hash);
                        $('#donate').modal('hide');
                    }
                }
            }
            preloader(form, 1);
            break;
    }

    form.removeClass('submitted');
}

/*FORM AJAX*/
/*FORM AJAX*/
/*FORM AJAX*/
/*FORM AJAX*/
/*FORM AJAX*/
/*FORM AJAX*/
/*FORM AJAX*/

function popupOpen(html, cantclose, clss, noarrow) {
    if (html) {
        if ($.isArray(html)) {
            html = '<div>' + html.join('</div><div>') + '</div>';
        }
        $.dialog({
            content: html,
            title: false,
        });
        bindFormAjax();
        winResize();
    }
}

function strpos(haystack, needle, offset) {	// Find position of first occurrence of a string
    //
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)

    var i = haystack.indexOf(needle, offset); // returns -1
    return i >= 0 ? i : false;
}

function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
}


function startProgress() {
    var files = [];
    $.each(progressFiles, function (i, v) {



        files[i] = '<div class="progressFile"><div class="name">' + v.name + '</div><div class="bar"><span>' + 0 + '%</span><div class="inbar"></div></div></div>';
    });
    popupOpen(files);
}

function uploadProgress(e) {
    var loaded = e.loaded;
    var total = e.total;

    var start = 0;
    var perc = 0;
    var diff = 0;
    var abs = 0;

    $.each(progressFiles, function (i, v) {
        start += v.size;
        perc = 0;
        diff = loaded - start;
        if (diff > 0) {
            perc = 100;
        } else {
            abs = Math.abs(diff);
            if (abs < v.size) {
                perc = (100 - (abs / v.size) * 100).toFixed(2);
            }
        }

        $($('.progressFile')[i]).find('.bar span').html(perc + '%');
        $($('.progressFile')[i]).find('.inbar').width(perc + '%');
    });
}

function closeProgress() {
    progressFiles = [];
    if ($('.progressFile').length) {
        $('.progressFile').parents('.jconfirm-box-container').find('.closeIcon').click();
    }
}

function replaceForms(data) {
    $("#"+data.part).html(data.html);
    showEp('.'+data.part, '.lkm-ep-wrap');
    reinitPage();
    masonryInit();
    galeryInit();
    bindSelectMenu($( ".select" ));

    if($('#noIndColor, #noIndColor2').length)
        $('#noIndColor, #noIndColor2').colorpicker({
            displayIndicator: false
        });

    if (typeof $('#userverifications-doc_end_date')[0] !== 'undefined' ) {
        $('#userverifications-doc_end_date').kvDatepicker({"autoclose":true,"format":"dd.mm.yyyy"});
    }

}

(function(history){
    var pushState = history.pushState;
    history.pushState = function(state) {
        if (typeof history.onpushstate == "function") {
            history.onpushstate({state: state});
        }
        return pushState.apply(history, arguments);
    }
})(window.history);

window.onpopstate = history.onpushstate = function (e) {

    if(typeof e != 'undefined' && typeof e.state != 'undefined' && typeof e.state.type != 'undefined' ){
        switch (e.state.type){
            case 'dialog':
                preloader($('.drp-cw').parent());
                $.get(e.state.url, {partial:1}, function(data){
                    $('.drp-cw').html(data);
                    preloader($('.drp-cw').parent(), 1);
                    winResize();
                    setBottomScroll();
                    if ($('.emj').length)
                        emojiStart();
                    bindFormAjax();
                    buildDialogTabs();
                    $(".html5lightbox").html5lightbox();
                });
                break;
            case 'dialog_main':
                preloader($('.drp-cw').parent());
                $.get(e.state.url, {partial:1}, function(data){
                    $('.dialog-block-wrap').replaceWith(data);
                    preloader($('.drp-cw').parent(), 1);
                    winResize();
                    setBottomScroll();
                    if ($('.emj').length)
                        emojiStart();
                    bindFormAjax();
                    buildDialogTabs();
                    $(".html5lightbox").html5lightbox();
                    bindSelectMenu($(".select"));
                    bindPushState();
                });
                break;
        }
    }

}

