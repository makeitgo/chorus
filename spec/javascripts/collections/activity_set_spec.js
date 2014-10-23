describe("chorus.collections.ActivitySet", function() {
    describe("#url", function() {
        context("when the collection has the 'insights' attribute set to true", function() {
            beforeEach(function() {
                this.collection = new chorus.collections.ActivitySet([], { insights: true });
            });

            context("and collection is for the dashboard", function() {
                it("returns the url for fetching all insights", function() {
                    expect(this.collection.url()).toHaveUrlPath("/insights");
                    expect(this.collection.url()).toContainQueryParams({entity_type : "dashboard"});
                });
            });

            context("and collection is for a workspace", function() {
                it("returns the url for fetching insights belonging to a workspace", function() {
                    this.collection.attributes.entity = backboneFixtures.workspace({ id: 21 });
                    expect(this.collection.url()).toHaveUrlPath("/insights");
                    expect(this.collection.url()).toContainQueryParams({entityType : "workspace", entityId: 21, perPage : 20});
                });
            });

            it("returns the url that contains the given options", function() {
                expect(this.collection.url({page: 4})).toContainQueryParams({page: 4});
            });
        });

        context("for a hdfs model type", function () {
            it("includes the entity_type, the ", function() {
                var model = backboneFixtures.hdfsFile({
                    id: 8789,
                    hdfsDataSource : { id : 1 },
                    path : "/data",
                    name : "test.csv"
                });

                var activities = new chorus.collections.ActivitySet([], {entity: model} );
                expect(activities.url()).toContain("/activities?entity_type=hdfs_file&entity_id=8789" );
            });
        });

        context("for a non-hdfs model type", function () {
            it("includes the entity_type and the id of the model", function() {
                var model = new chorus.models.Base({id: 1});
                model.entityType = "hello";
                var activities = new chorus.collections.ActivitySet([], {entity: model} );
                expect(activities.url()).toContain("/activities?entity_type=hello&entity_id=" + model.id );
            });
        });

        context("with a HdfsEntry", function() {
            it("doesn't throw an error, even though HdfsEntry doesn't have a url (to keep other specs passing)", function() {
                var model = new chorus.models.HdfsEntry();
                expect(function() {
                    return new chorus.collections.ActivitySet([], {entity: model} );
                }).not.toThrow();
            });
        });
    });

    describe("#setup", function() {
        it("binds 'reset' to reindexing the errors", function() {
            spyOn(chorus.collections.ActivitySet.prototype, "reindexErrors");
            this.collection = new chorus.collections.ActivitySet([]);
            this.collection.trigger("reset");
            expect(this.collection.reindexErrors).toHaveBeenCalled();
        });
    });

    describe("#reindexErrors", function() {
        beforeEach(function() {
            this.activity = {
                reindexError: function() {}
            };
            this.collection = new chorus.collections.ActivitySet([this.activity]);
            spyOn(this.collection.models[0], "reindexError");
        });

        it("reindexes the errors", function() {
            this.collection.reindexErrors();
            expect(this.collection.models[0].reindexError).toHaveBeenCalled();
        });
    });
});

