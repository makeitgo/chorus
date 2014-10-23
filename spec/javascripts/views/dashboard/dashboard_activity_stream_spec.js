describe("chorus.views.DashboardActivityStream", function() {
    beforeEach(function() {
        this.view = new chorus.views.DashboardActivityStream({content: "ActivityStream"});
        this.activities = new chorus.collections.ActivitySet([]);
    });

    describe("#setup", function() {
        it("fetches the activities", function() {
            expect(this.activities).toHaveBeenFetched();
        });

        it("does not re-fetch the activity list if a comment is added", function() {
            this.server.reset();
            chorus.PageEvents.trigger("comment:added", backboneFixtures.comment());
            expect(this.activities).not.toHaveBeenFetched();
        });

        it("does not re-fetch the activity list if a comment is deleted", function() {
            this.server.reset();
            chorus.PageEvents.trigger("comment:deleted", backboneFixtures.comment());
            expect(this.activities).not.toHaveBeenFetched();
        });
    });

    describe("the header", function() {
        beforeEach(function() {
            this.headerView = this.view.contentHeader;
        });

        it("is an ActivityListHeader view", function() {
            expect(this.headerView).toBeA(chorus.views.ActivityListHeader);
        });

        it("has the right titles for both 'all' and 'insights' modes", function() {
            expect(this.headerView.options.allTitle).toMatchTranslation("dashboard.title.activity");
            // expect(this.headerView.options.insightsTitle).toMatchTranslation("dashboard.title.insights");
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("has an activity list", function() {
            expect(this.view.content).toBeA(chorus.views.ActivityList);
            expect(this.view.$(".activity_list")).toExist();
        });
    });
});
