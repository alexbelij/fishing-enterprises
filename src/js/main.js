class main {
    // Enum of all states
    static states = {
        none: 0,
        fishing: 1,
        business: 2,
        enterprise: 3
    }

    // The current game state
    static state = main.states.none;

    static initialize() {
        // Load the main menu
        main_menu.initialize();
    }

    static update() {
        switch (main.get_state()) {
            case 1:
                fishing_area.update();
                break;
        }
    }

    static transition(callback) {
        const content = $("#content");
        // Fade out all content
        content.fadeOut(400, () => {
            // Remove all content
            content.empty();

            // Add any content from the callback
            if (callback != null) {
                callback();
            }

            // Fade in content
            content.fadeIn();
        });
    }

    static get_state() {
        return main.state;
    }

    static set_state(state) {
        main.state = state;
    }
}