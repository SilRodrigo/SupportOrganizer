$(document).ready(function () {    
    var typingTimer;

    $('#newSupport').on('show.bs.modal', () => {
        toggleLoading('New');
    });

    $('#newSupport').on('shown.bs.modal', function () {
        $(this).find('[autofocus]').focus();
        let today = calendar();
        $('#newSupport').find("input[type=date]").val(today.currentDate);
        $('#newSupport').find("input[type=time]").val(today.currentTime);
        toggleLoading('New');
    });

    $('#editSupport').on('show.bs.modal', () => {
        toggleLoading('Edit');
    });

    $('#editSupport').on('shown.bs.modal', () => {
        let today = calendar();
        $('#editSupport').find("input[type=date]").val(today.currentDate);
        $('#editSupport').find("input[type=time]").val(today.currentTime);
        toggleLoading('Edit');
    });

    $('#editSupport').on('hidden.bs.modal', () => {
        $('.icon:visible').hide();
    });

    $('#generateReport').on('hide.bs.modal', () => {
        $('.dropDown-menu-open').removeClass("dropDown-menu-open").addClass("dropDown-menu-close");
    });

    $('#generateReport').on('show.bs.modal', () => {
        $(this).find('[autofocus]').focus();
        $('#generateReport').find("#initDate").val(getFirstMonday());
        $('#generateReport').find("#endDate").val(getFirstFriday());
    });

    $('.exclude').mouseover(() => {
        $('.exclude').text('Excluir');
        setTimeout(() => {
            if ($('.exclude').text() === 'Excluir') $('.exclude:hover').attr('onClick', 'excludeSupport()')
        }, 300);
    })

    $('.exclude').mouseout(() => {
        $('.exclude').text('↵')
        $('.exclude').removeAttr('onClick');
    })

    $('.renounce').mouseover(() => {
        $('.renounce').text('Renuir');
        setTimeout(() => {
            if ($('.renounce').text() === 'Renuir') $('.renounce:hover').attr('onclick', 'updateSupport(1)');
        }, 300);
    })

    $('.renounce').mouseout(() => {
        $('.renounce').text('↵')
        $('.renounce').removeAttr('onClick');
    })

    $('.quickSupport').click(() => {
        if ($('.quickSupport').hasClass("quickSupport-hover-icon-animation")) {
            $('#newSupport').find('.btn-success').text('Abrir chamado e Encerrar');
            $('.quickSupport').removeClass("quickSupport-hover-icon-animation")
            $('.quickSupport').find('i').removeClass("quickSupport-close-icon-animation").addClass("quickSupport-open-icon-animation");
            $('.quickSupport-dropDown-div-close').removeClass("quickSupport-dropDown-div-close").addClass("quickSupport-dropDown-div-open");
            $('.quickSupport-dropDown-div-open').find('textarea').focus();
            $('#quickSupportForm').find('input[type=date]').attr('tabindex', '0');
            $('#quickSupportForm').find('input[type=time]').attr('tabindex', '0');
            $('#quickSupportForm').find('textarea').attr('tabindex', '0');
        }
        else {
            $('#newSupport').find('.btn-success').text('Abrir chamado');
            $('.quickSupport').find('i').removeClass("quickSupport-open-icon-animation").addClass("quickSupport-close-icon-animation");
            $('.quickSupport-dropDown-div-open').removeClass("quickSupport-dropDown-div-open").addClass("quickSupport-dropDown-div-close");
            $('.quickSupport').addClass("quickSupport-hover-icon-animation")
            $('#quickSupportForm').find('input[type=date]').attr('tabindex', '-1');
            $('#quickSupportForm').find('input[type=time]').attr('tabindex', '-1');
            $('#quickSupportForm').find('textarea').attr('tabindex', '-1');
        }
    })

    $(".my-heading-compose-side").click(function () {
        $(".side-two").css({
            "left": "0"
        });
    });

    $(".endedSupport-back").click(function () {
        $(".side-two").css({
            "left": "-100%"
        });
    });

    $('.fa-ellipsis-v').click(() => {
        if ($('.dropDown-menu-open').length > 0) {
            $('.dropDown-menu-open').removeClass("dropDown-menu-open").addClass("dropDown-menu-close");
        }
        else {
            $('.dropDown-menu').removeClass("dropDown-menu-close").addClass("dropDown-menu-open");
        }
    })

    $('.navigate-button').click(() => {
        if ($('.navigate-button').hasClass('navigate-button-left')) {
            $('.navigate-button').find('i').removeClass("fa-chevron-left").addClass("fa-chevron-right")
            $('.navigate-button').removeClass("navigate-button-left").addClass("navigate-button-right");
            $('.column-left').hide();
            $('.column-right').show();
        }
        else {
            $('.navigate-button-right').find('i').removeClass("fa-chevron-right").addClass("fa-chevron-left")
            $('.navigate-button-right').removeClass("navigate-button-right").addClass("navigate-button-left");
            $('.column-right').hide();
            $('.column-left').show();
        }
    })

    $('#closed-search').on('keyup', function () {        
        clearTimeout(typingTimer);                
        typingTimer = setTimeout(() => {filteringSupports(this.value, 3, 'closureSupportList')}, 700);
    });

    $('#closed-search').on('keydown', function () {
        clearTimeout(typingTimer);
    });

    toggleLoading('New');
    toggleLoading('Edit');
    toggleLoading('Generate');
    communicate();
    updateOpenSupports();
    mute();
});