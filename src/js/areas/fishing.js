class fishing {
    static data = null;
    static is_fishing = false;

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
                id: "cast-out",
                text: "Cast out line",
                on_click: () => {
                    fishing.swap_state();
                }
            });
            new button({
                parent: "#resource-buttons",
                id: "reel-in",
                text: "Reel in line",
                on_click: () => {
                    fishing.swap_state();
                }
            }).get_element()
                // Stop the fade in
                .stop()
                // Fade to the disabled opacity
                .fadeTo(400, 0.4)
                .prop("disabled", true);
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
            .css("visibility", "hidden")
            .appendTo(counters);
        // Create area headers and counter holders
        const data = area_data.get_list();
        for (const name in data) {
            const settings = data[name];

            // Create this area's counter section
            const section = $("<div>")
                .attr("id", settings.internal + "-counters")
                .hide()
                .appendTo(fish_counters);

            // Create the header
            const header = $("<div>")
                .addClass("counter-header centered")
                .text(settings.display)
                .appendTo(section);
            $("<div>")
                .addClass("counter-break")
                .appendTo(header);

            // Create the fish counters
            const fish_data = settings.fish;
            for (const fish_name in fish_data) {
                const fish = fish_data[fish_name];

                const fish_counter = $("<div>")
                    .addClass("counter")
                    .text(fish.display + ": ")
                    .hide()
                    .appendTo(section);
                // Create the current fish count
                $("<span>")
                    .attr("id", fish.internal + "-count")
                    .text("0")
                    .appendTo(fish_counter);
                // Create the max fish count
                $("<span>")
                    .attr("id", fish.internal + "-max")
                    .addClass("counter-max")
                    .text("/" + fish.max)
                    .hide()
                    .appendTo(fish_counter);
            }
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
                .css("visibility", "hidden")
                .appendTo(misc);
        }

        // Create the buttons section
        $("<div>")
            .attr("id", "resource-buttons")
            .appendTo(parent);
    }

    static update() {
        if (!fishing.is_fishing) {
            return;
        }

        // Loop through all fish in the current area
        const data = fishing.get_data();
        const fish_data = data.fish;
        for (const index of utils.shuffle(Object.keys(fish_data))) {
            const fish = fish_data[index];

            // Roll a chance to check the conditions on this fish
            if (utils.random(0, 100) < fish.chance && fishing.conditions(fish)) {
                fish.count++;
                fish.total++;

                // Update the fish counter
                const counter = $("#" + fish.internal + "-count")
                    .css("opacity", fish.count == fish.max ? "0.5" : "1.0")
                    .text(utils.stringify(fish.count));

                // Display the counter if it is hidden
                if (!fish.caught) {
                    fish.caught = true;
                    counter.parent().fadeIn();

                    // Show the unique fish message (only on first catch)
                    messenger.write(fish.display + ": " + fish.message);
                }

                // Check if the max count should be displayed
                if (fish.count == fish.max && !fish.show_max) {
                    fish.show_max = true;

                    $("#" + fish.internal + "-max")
                        .show();
                }

                // Check if this is the first fish caught in this area
                const counters = $("#" + data.internal + "-counters");
                if (counters.css("visibility") == "hidden") {
                    counters.css("visibility", "visible").hide().fadeIn();
                }

                // Check if this is the first fish caught ever
                const section = $("#fish-counters");
                if (section.css("visibility") == "hidden") {
                    section.css("visibility", "visible").hide().fadeIn();
                }

                // Return so that two fish cannot be caught on the same update
                return;
            }
        }
    }

    static conditions(fish) {
        const data = fishing.get_data().fish;

        // Check if the current count is equal to the maximum number of fish
        if (fish.count == fish.max) {
            return false;
        }

        // Check if there is a prerequisite fish
        if (fish.after != null) {
            // Check if the fish has been caught
            if (!data[fish.after].caught) {
                return false;
            }
        }

        return true;
    }

    static swap_state() {
        fishing.is_fishing = !fishing.is_fishing;

        // Swap button disables
        $("#cast-out-button")
            .prop("disabled", fishing.is_fishing);
        $("#reel-in-button")
            .prop("disabled", !fishing.is_fishing);
    }

    static get_data() {
        return fishing.data;
    }
}