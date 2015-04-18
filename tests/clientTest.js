
// if i just call MochaWeb.testOnly I get this error
// loading source file: /Users/mike/velocity/example/mocha-web-tests/client/clientTest.js
// Exception loading helper: /Users/mike/velocity/example/packages/jasmine-unit/lib/loader-helper.js
// [ReferenceError: MochaWeb is not defined]

if (!(typeof MochaWeb === 'undefined')){
    MochaWeb.testOnly(function(){
        describe("Select Grace Hopper", function(){
            before(function(done){
                Meteor.autorun(function(){
                    done();
                });
            });

            it("should show Grace the inside div class='name' (above the give points button)", function(){
                assert.equal(false, "fale");
            });
        });
    });
}

