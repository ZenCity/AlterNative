Template.main.events({
    'click .top-back-button': function(){
        window.history.back();
    },
    'click .lang' : changeLanguage
});

//register event to close hamburger menu navbar on click outside of the navbar area
$(document).click(function (event) {
    var clickover = $(event.target);
    var $navbar = $(".navbar-collapse");               
    var _opened = $navbar.hasClass("in");
    if (_opened === true && !clickover.hasClass("navbar-toggle")) {      
        $navbar.collapse('hide');
    }
});