var shop = {
    internal: "shop",

    buttons: {
        sell_fish: {
            data: {
                parent: "above_section",
                id: "sell_fish",
                text: function() {
                    return "Sell fish ($" + shop.fish_value(false) + ")";
                },
                on_click: function() {
                    shop.sell_fish();
                },
                disabled: function() { 
                    return shop.fish_value(false) == 0; 
                }, 
            }
        },
        buy_fuel: {
            condition: function() {
                return !$("#reef_button")
                    .is(":hidden");
            },
            data: {
                parent: "misc_section",
                id: "buy_fuel",
                text: "Fuel ($5)",
                on_click: function() {
                    shop.purchase_item(resources.fuel);
                },
                disabled: function() {
                    let fuel = resources.fuel;
                    return resources.money.count < 5 || fuel.count == fuel.max;
                }
            }
        }
    },

    initialize() {
        let parent = $("#resource_buttons");
        $("<div>")
            .attr("id", "above_section")
            .appendTo(parent);

        let names = ["Bait", "Tackle", "Misc"];
        for (let name of names) {
            $("<div>")
                .attr("id", name.toLowerCase() + "_section")
                .attr("display", name)
                .addClass("before")
                .addClass("section")
                .appendTo(parent);
        }
        $("#tackle_section")
            .addClass("section_center")
        $("#misc_section")
            .addClass("section_right")

        for (let index in this.buttons) {
            let item = this.buttons[index];
            if (this.check_button(item)) {
                let element = $("#" + item.data.parent);
                if ($(element)
                    .is(":hidden")) {
                    $(element)
                        .fadeIn();
                }

                item.data["classes"] = ["button"];
                buttons.create(item.data);
            }
        }

        this.check_empty();
    },

    update() {
        for (let id in this.buttons) {
            let item = this.buttons[id];
            if ($("#" + item.data.id + "_button").length == 1) {
                $("#" + item.data.id + "_button")
                    .prop("disabled", item.data.disabled);
            } else {
                if (this.check_button(item)) {
                    item.data["classes"] = ["button"];
                    buttons.create(item.data);
                }
            }
        }

        for (let section of ["bait", "tackle", "misc"]) {
            let element = $("#no_sale_" + section);
            if (element
                .parent()
                    .children().length > 1) {
                $(element)
                    .remove();
            }
        }
        this.check_empty();
    },

    unload() {

    },

    update_money(value) {
        resources.money.count += value;

        if (value > 0) {
            resources.money.total += value;
        }

        counters.update();
        this.update();
    },

    fish_value(reset) {
        let amount = 0;
        for (let index in resources.fish) {
            let fish = resources.fish[index];
            if (fish.count != null) {
                amount += fish.count * fish.price;

                if (reset) {
                    fish.count = 0;
                }
            }
        }

        counters.update();

        return amount;
    },

    sell_fish() {
        this.update_money(this.fish_value(true));

        $("#sell_fish_button")
            .text("Sell fish ($0)");
    },

    purchase_item(item) {
        item.purchased = true;

        let element = $("#" + item.internal);
        let parent = $(element)
            .parent();
        if ($(parent)
                .attr("id") == "tackle_counters") {
            $(".tackle")
                .fadeIn();
        }

        if (item.count == null) {
            item.count = 0;
            item.total = 0;

            $(element)
                .fadeIn();
        }

        if (item.count < item.max) {
            item.count++;
            item.total++;

            this.update_money(-item.price);
        }

        counters.update();
    },

    purchase_area(name) {
        areas.list[name].unlocked = true;
        $("#" + name + "_button")
            .fadeIn();

        let data = areas.list[name].purchased;

        shop.remove_item(name + "_unlock");
        shop.update_money(-data.price);

        for (let item of data.buttons) {
            shop.add_item(name, item.resource, item.parent);
        }

        if (name == "pier") {
            boat.initialize();
        }
    },

    add_item(name, item, section) {
        shop.buttons[item.internal] = {
            condition: function() {
                return !$("#" + name + "_button")
                    .is(":hidden");
            },
            data: {
                parent: section + "_section",
                id: item.internal,
                text: item.display + " ($" + item.price + ")",
                on_click: function() {
                    shop.purchase_item(item);
                },
                disabled: function() {
                    return resources.money.count < item.price || item.count == item.max
                        && !shop.is_removed(item.internal);
                }
            }
        }
    },

    add_auto_buy_items(items) {
        for (let item of items.auto_buys) {
            let resource = item.resource;
            shop.buttons[resource.internal + "_auto_buy"] = {
                condition: function() {
                    return !$("#" + items.internal + "_button")
                        .is(":hidden");
                },
                data: {
                    parent: "misc_section",
                    id: resource.internal + "_auto_buy",
                    text: "Auto buy " + resource.display + " ($" + item.price + ")",
                    on_click: function() {
                        counters.add_auto_buy(resource);
                        shop.remove_item(resource.internal + "_auto_buy");
                        shop.update_money(-item.price);
                    },
                    disabled: function() {
                        return resources.money.count < item.price
                            && !shop.is_removed(resource.internal + "_auto_buy");
                    }
                }
            }
        }
    },

    remove_item(id) {
        this.buttons[id].removed = true;
        $("#" + id + "_button")
            .fadeOut();
        $("#" + id + "_break")
            .remove();
    },

    is_removed(id) {
        let removed = $("#" + id + "_button")
            .attr("removed");
        return removed == null ? false : removed;
    },

    check_button(item) {
        // check if the button is removed
        if (item.removed == null || !item.removed) {
            // check the item's display condition
            if (item.condition == null || item.condition()) {
                return true;
            }
        }

        return false;
    },

    check_empty() {
        let ids = ["bait", "tackle", "misc"]
        for (let id of ids) {
            let parent = $("#" + id + "_section");
            if ($(parent).children().length == 0) {
                $("<p>")
                    .attr("id", "no_sale_" + id)
                    .addClass("no_sale")
                    .text("Nothing for sale!")
                    .appendTo(parent);
            }
        }
    }
}