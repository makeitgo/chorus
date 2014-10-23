chorus.views.DashboardActivityStream = chorus.views.DashboardModule.extend({
    constructorName: "DashboardActivityStream",

    setup: function () {
        var activities = new chorus.collections.ActivitySet([]);
        activities.per_page = 10;
        activities.fetch();
        this.content = this.activityList = new chorus.views.DashboardActivityList({ collection: activities, additionalClass: "dashboard" });
        this.contentHeader = new chorus.views.DashboardModuleActivityListHeader({
            collection: activities,
            allTitle: t("dashboard.activity_stream.title")
        });
    }
});