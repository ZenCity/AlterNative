Router.route('/map', function () {
    this.render('map');
    $('body').removeClass('know-tint');
    $('body').addClass('map');
});

Router.route('/know', function () {
    if (Session.get('to') && Session.get('from')) {
        this.render('know');
        $('body').addClass('know-tint');
        $('body').removeClass('map');
    }
    else {
        Router.go('/');
    }
});

Router.route('/', function () {
    this.render('setRoute');
    $('body').removeClass('know-tint');
    $('body').removeClass('map');
});

Router.route('/backend_view', function () {
    this.render('dataVisualization');
});

Router.route('/about', function () {
    this.render('about');
});

Router.route('/calculations', function () {
    this.render('calculations');
});

