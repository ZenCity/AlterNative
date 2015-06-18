Router.route('/', function(){
    Router.go('/search');
});

Router.route('/map', function () {
    this.render('map');
    $('body').removeClass('know-tint');
    $('body').addClass('map');
});

Router.route('/results', function () {
    if (Session.get('to') && Session.get('from')) {
        this.render('results');
        $('body').addClass('know-tint');
        $('body').removeClass('map');
    }
    else {
        Router.go('/search');
    }
});

Router.route('/search', function () {
    this.render('search');
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

Router.route('/login', function () {
    this.render('login');
});

