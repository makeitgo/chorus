describe("chorus.pages.TagShowPage", function() {
    var tag, page;
    beforeEach(function() {
        tag = new chorus.models.Tag({name: "tag-name"});
        page = new chorus.pages.TagShowPage(tag.name());
    });

    describe("breadcrumbs", function() {
        beforeEach(function() {
            page.render();
        });

        it("displays the Tags breadcrumb", function() {
            var breadcrumbs = page.$("#breadcrumbs .breadcrumb a");

            expect(breadcrumbs.eq(0).attr("href")).toBe("#/");
            expect(breadcrumbs.eq(0).text()).toBe(t("breadcrumbs.home"));

            expect(breadcrumbs.eq(1).attr("href")).toBe("#/tags");
            expect(breadcrumbs.eq(1).text()).toBe(t("breadcrumbs.tags"));

            expect(page.$("#breadcrumbs .breadcrumb .slug")).toContainText(tag.name());
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            page.render();
        });

        it('displays the page title', function() {
            expect(page.$('h1')).toContainTranslation("tag.show.title", {name: "tag-name"});
        });
    });
});
