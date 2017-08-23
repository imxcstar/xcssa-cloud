var loginz;
var registerz;
var fpasswordz;
var create_folder_z;
var show_up_file_z;

$(function () {
    loginz = $('#loginz');
    registerz = $('#registerz');
    fpasswordz = $('#fpasswordz');
    create_folder_z = $('#create_folder_z');
    show_up_file_z = $('#show_up_file_z');
    
    $("a.login").click(function () {
        loginz.modal({ closeViaDimmer: false });
    });

    $("a.zs").click(function () {
        registerz.modal('close');
        fpasswordz.modal('close');
        loginz.modal({ closeViaDimmer: false });
    });

    $("button.register").click(function () {
        loginz.modal('close');
        registerz.modal({ closeViaDimmer: false });
    });

    $("a.fpassword").click(function () {
        loginz.modal('close');
        fpasswordz.modal({ closeViaDimmer: false });
    });

    $("button.show_create_folder").click(function () {
        $(".create_folder_name").val("");
        create_folder_z.modal({ closeViaDimmer: false });
    });

    $("button.show_up_file").click(function () {
        show_up_file_z.modal({ closeViaDimmer: false });
    });

    //show_up_file_z.modal({ closeViaDimmer: false });

    $.ajax({
        url: "/slogin?" + (new Date()).getTime(),
        type: "get",
        dataType: "json",
        success: function (data) {
            login_register();
            if (data.status === 0) {
                login_success(data);
            } else {
                $(".login").show();
            }
        }
    });
});