class fishing {
    static data = null;

    static initialize(name) {
        main.transition(() => {
            // Create initial HTML
            if (fishing.get_data() == null) {
                fishing.create_elements();
            }

            // Set the game state
            main.set_state(main.states.fishing);
            // Load fishing area CSS
            css.replace(["areas/fishing"]);
            // Set the area data
            fishing.data = area_data.get(name);

            if (name == "lake") {
                new button({
                    parent: "#resource-buttons",
                    text: "Forage for worms"
                });
            }

            // Create fishing buttons
            new button({
                parent: "#resource-buttons",
                text: "Cast out line"
            });
            new button({
                parent: "#resource-buttons",
                text: "Reel in line"
            });
        });
    }

    static create_elements() {
        const parent = $("#content");

        // Create the counters section
        const counters = $("<div>")
            .attr("id", "resource-counters")
            .appendTo(parent);

        // Create the fish counters
        const fish_counters = $("<div>")
            .attr("id", "fish-counters")
            .attr("section-header", "Fish")
            .addClass("section")
            .appendTo(counters);
        // Create area headers and counter holders
        const data = area_data.get_list();
        for (const name in data) {
            const settings = data[name];

            // Create the header
            const header = $("<div>")
                .attr("id", settings.internal + "-counters")
                .addClass("counter-header centered")
                .text(settings.display)
                .appendTo(fish_counters);
            $("<div>")
                .addClass("line-break")
                .appendTo(header);
        }
        
        // Bundle up the rest of the counters so they're stacked on top of each other
        const misc = $("<div>")
            .attr("id", "misc-counters")
            .appendTo(counters);
        for (const id of ["bait", "tackle", "boat"]) {
            $("<div>")
                .attr("id", id + "-counters")
                .attr("section-header", utils.capitalize(id))
                .addClass("section")
                .appendTo(misc);
        }

        // Create the buttons section
        $("<div>")
            .attr("id", "resource-buttons")
            .appendTo(parent);
    }

    static update() {

    }

    static create_fish_counter() {
    }

    static create_misc_counter() {

    }

    static get_data() {
        return fishing.data;
    }
}