describe("chorus.collections.TaggingSet", function() {
    beforeEach(function() {
        this.model = new chorus.models.Base({id: 33});
        this.model.entityType = "modelClass";

        this.collection = new chorus.collections.TaggingSet([
            {name: "foo"},
            {name: "bar"}
        ], { entity: this.model });
    });

    it("has the right url", function() {
        expect(this.collection.url()).toHaveUrlPath("/taggings");
    });

    describe("#save", function() {
        beforeEach(function() {
            this.collection.save();
        });

        it("passes in entityId and entityType", function() {
            expect(this.server.lastCreate().params().entity_type).toBe("modelClass");
            expect(this.server.lastCreate().params().entity_id).toBe('33');
        });

        it("should save an array of tag_names", function() {
            expect(this.server.lastCreate().params()['tag_names[]']).toEqual(['foo', 'bar']);
        });
    });

    describe("#containsTag", function() {
        it("compares tag names ignoring case", function() {
            expect(this.collection.containsTag('foo')).toBe(true);
            expect(this.collection.containsTag('FOO')).toBe(true);
            expect(this.collection.containsTag('baz')).toBe(false);
        });
    });
});