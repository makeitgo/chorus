describe("InstanceListSidebar", function() {
    beforeEach(function() {
        this.view = new chorus.views.InstanceListSidebar();
    });

    describe("render", function() {
        beforeEach(function() {
            this.view.render();
        });
        describe("when no instance is selected", function() {
            it("should not display instance information", function() {
                expect(this.view.$(".info")).not.toExist();
            });
        });
    });

    describe("instance:selected event handling", function() {
        beforeEach(function() {
            $('#jasmine_content').append(this.view.el);
            this.activityViewStub = stubView("OMG I'm the activity list")
            spyOn(chorus.views, 'ActivityList').andReturn(this.activityViewStub)

            this.instance = fixtures.instance({instanceProvider: "Greenplum", name : "Harry's House of Glamour"})
            spyOn(this.instance, 'fetch');
            spyOn(this.instance.activities(), 'fetch');
            this.view.trigger("instance:selected", this.instance);
        });

        it("displays instance name", function() {
            expect(this.view.$(".instance_name").text()).toBe("Harry's House of Glamour");
        });

        it("displays instance type", function() {
            expect(this.view.$(".instance_type").text()).toBe("Greenplum");
        });

        it("renders ActivityList subview", function() {
            expect(this.view.$(".activity_list")).toBeVisible();
            expect(this.view.$(".activity_list").text()).toBe("OMG I'm the activity list")
        });

        it("populates the ActivityList with the activities", function() {
            expect(chorus.views.ActivityList.mostRecentCall.args[0].collection).toBe(this.instance.activities());
        });

        it("fetches the activities", function() {
            expect(this.instance.activities().fetch).toHaveBeenCalled();
        });

        it("fetches the details for the instance", function() {
            expect(this.instance.fetch).toHaveBeenCalled();
        });

        context("when activity is clicked", function() {
            beforeEach(function() {
                this.view.$(".tab_control li.configuration").click();
                expect(this.view.$(".activity_list")).not.toBeVisible();
                this.view.$(".tab_control li.activity").click();
            })

            it("shows activity", function() {
                expect(this.view.$(".activity_list")).toBeVisible();
                expect(this.view.$(".configuration_detail")).not.toBeVisible();
            })
        })

        context("when configureation is clicked", function() {
            beforeEach(function() {
                expect(this.view.$(".configuration_detail")).not.toBeVisible();
                this.view.$(".tab_control li.configuration").click();
            })

            it("shows activity", function() {
                expect(this.view.$(".configuration_detail")).toBeVisible();
                expect(this.view.$(".activity_list")).not.toBeVisible();
            })
        })
    });

});