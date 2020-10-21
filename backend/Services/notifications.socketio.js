module.exports = function (server) {
    var io = require('socket.io').listen(server);

    const notificacionesController = require('../Controllers/NotificationController');
    const documents = {};
    var connections = [];

    io.on("connection", socket => {
        // Se guardan las coneciones de los usuario que conectan
        connections.push(socket);
        connections = connections.filter(c => c != undefined);

        socket.on("disconnect", function () {
            console.log('Usuario desconectado: ' + socket.username);
            connections = connections.filter(c => { return c.username != socket.username });
        });

        socket.on("suscribeById", async (data) => {
            socket.username = data;
            console.log('Usuario conectado: ' + socket.username);
        });

        let previousId;
        const safeJoin = currentId => {
            socket.leave(previousId);
            socket.join(currentId);
            previousId = currentId;
        };

        /**
         * MANEJO DE NOTIFICACIONES 
         */
        socket.on("getDoc", docId => {
            safeJoin(docId);
            const res = { id: docId  }
            socket.emit("document", res);
        });

        socket.on("getNotificaciones", async doc => {
            let notificaiones = await notificacionesController.allNotifications();
            io.emit("documents", notificaiones);
        });

        socket.on("sesionExpire", async code => {
            var recipient = connections.filter(function (recipient) {
                return recipient.username == code;
            })[0];

            if (recipient != undefined) io.sockets.in(recipient.id).emit("sesionExpireClient", code);
        });

        socket.on("editDoc", doc => {
            documents[doc.id] = doc;
            socket.to(doc.id).emit("document", doc);
        });

        socket.on("onNotification", async (data) => {
            var recipient = connections.filter(function (recipient) {
                return recipient.username == data;
            })[0];

            if (recipient != undefined) {
                let notificaciones = await notificacionesController.allNotificationsUserCommerce(data);
                io.sockets.in(recipient.id).emit("emitNotification", notificaciones.length);
            }
        });

    });
}