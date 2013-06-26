function setup(app, handlers) {
    app.post('/api/media', handlers.api.media.generate_form);
    app.post('/api/media/:id', handlers.api.media.publish);       
    app.put('/api/media/:id', handlers.api.media.publish);
    app.get('/api/media/:userId', handlers.api.media.get_by_author);
    app.del('/api/media/:id', handlers.api.media.delete);
}
 
exports.setup = setup;