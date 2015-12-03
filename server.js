var Hapi = require('hapi');
var server = new Hapi.Server();
var bell = require('bell');
server.connection({ port: 3000 });

function checkPassword(data) {
	var return_string;
	if(data.password === data.password_confirm) {
		return_string = "confirmed password";
	}
	else {
		return_string = "password does not match";
	}
	return return_string;
}
server.register(bell, (err) => {
  server.auth.strategy('google', 'bell', {
        provider: 'google',
        password: 'password',
        isSecure: false,
        // You'll need to go to https://console.developers.google.com and set up an application to get started
        // Once you create your app, fill out "APIs & auth >> Consent screen" and make sure to set the email field
        // Next, go to "APIs & auth >> Credentials and Create new Client ID
        // Select "web application" and set "AUTHORIZED JAVASCRIPT ORIGINS" and "AUTHORIZED REDIRECT URIS"
        // This will net you the clientId and the clientSecret needed.
        // Also be sure to pass the location as well. It must be in the list of "AUTHORIZED REDIRECT URIS"
        // You must also enable the Google+ API in your profile.
        // Go to APIs & Auth, then APIs and under Social APIs click Google+ API and enable it.
        clientId: '250947141266-borodb5j61p6og3055duh31c8snln6mb.apps.googleusercontent.com',
        clientSecret: 'GIyQtYoTKe_oO8buw242k0dy',
        location: server.info.uri
    });
});

  

server.register(require('inert'), function (err) {
    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            reply.file('./public/hello.html');
        }
    });
     server.route({
        method: 'GET',
        path: '/register',
        handler: function (request, reply) {
            reply.file('./public/register.html');
        }
    });
      server.route({
        method: 'POST',
        path: '/register',
        handler: function (request, reply) {
            
            var data = request.payload;
            console.log(data);
         	reply(checkPassword(data));
        }
    });
      server.route({
        method: 'GET',
        path: '/login',
        handler: function (request, reply) {
            reply.file('./public/login.html');
        }
    });
      server.route({
        method: '*',
        path: '/bell/door',
        config: {
            auth: {
                strategy: 'google',
                mode: 'try'
            },
            handler: function (request, reply) {

                if (!request.auth.isAuthenticated) {
                    return reply('Authentication failed due to: ' + request.auth.error.message);
                }
                reply('<pre>' + JSON.stringify(request.auth.credentials, null, 4) + '</pre>');


                return reply.redirect('/userpage');
            }
        }
    });
       
});


server.start(function () {
    console.log('Server running at:', server.info.uri);
});

