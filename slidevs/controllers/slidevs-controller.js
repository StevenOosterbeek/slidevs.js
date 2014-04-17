module.exports = {

    serve: function(req, res) {
        res.sendfile(req.app.get('slidevsFolder') + '/slidevs.html');
    }

};