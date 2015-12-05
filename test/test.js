var Lab = require("lab");          
var lab = exports.lab = Lab.script(); 
var Code = require("code");      
var server = require("../server.js"); 

lab.experiment("Basic HTTP Tests", function() {
    // tests
    lab.test("register", function(done) {
        var options = {
            method: "POST",
            url: "/register",
            payload:{
                username: 'shrey',
                email: 'shrey_vithalani@yahoo.com',
                password: 'shrey',
                password_confirm: 'shrey'
            }
        };  
        server.inject(options, function(response) {
             
            Code.expect(response.statusCode).to.equal(400);
            Code.expect(response.result).to.be.an.object();
            server.stop(done);  
        });
    });
});