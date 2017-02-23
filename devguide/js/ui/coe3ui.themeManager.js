var coe3ui = coe3ui || {};
coe3ui.themeManager = (function() {


    var themeChangeCallbacks = []; //{};
    var themes = {
        dark: {
            FONT_COLOR: "#FFFFFF",
            FONT_COLOR_REVERSE: "#000000",
            BG_STATUS_BAR: "#000000",
            BG_APP_BAR: "#212121",
            BG: "#303030",
            BG_CARDS: "#424242"
        },
        light: {
            FONT_COLOR: "#000000",
            FONT_COLOR_REVERSE: "#000000",
            BG_STATUS_BAR: "#e0e0e0",
            BG_APP_BAR: "#F5F5F5",
            BG: "#FAFAFA",
            BG_CARDS: "#FFFFFF",
            PRIMARY: "",
            ACCENT: ""
        }
    };


    function notifyThemeChange(theme) {
        var i,
            len = themeChangeCallbacks.length;

        for (i = 0; i < len; i++) {
            if (typeof themeChangeCallbacks[i] === "function") {
                themeChangeCallbacks[i](theme);
            }
        }

    }

    var currentTheme = themes.light;

    var publicInterface = {
        setDark: function() {
            if (currentTheme !== themes.dark) {
                currentTheme = themes.dark;
                notifyThemeChange(currentTheme);
            }
        },
        setLight: function() {
            if (currentTheme !== themes.light) {
                currentTheme = themes.light;
                notifyThemeChange(currentTheme);
            }
        },
        toggleTheme: function() {
            if (currentTheme === themes.light) {
                currentTheme = themes.dark;
            } else {
                currentTheme = themes.light;
            }
            notifyThemeChange(currentTheme);

        },
        getTheme: function() {
            return currentTheme;
        },
        registerThemeListener: function(callback) {
            //themeChangeCallbacks[callback] = callback;
            themeChangeCallbacks.push(callback); // = callback;
        },
        removeThemeListener: function(callback) {
            var i,
                len = themeChangeCallbacks.length;

            for (i = 0; i < len; i++) {
                if (typeof themeChangeCallbacks[i] === callback) {
                    themeChangeCallbacks[i] = null;
                    break;
                }
            }
        }
    };
    return publicInterface;
}());
