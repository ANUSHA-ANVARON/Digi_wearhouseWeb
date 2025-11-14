// tailwind.config.js
module.exports = {
    theme: {
        extend: {
            backgroundImage: {
                'blue-sky': 'linear-gradient(to bottom, #61C2FF, #FFFFFF)',
            },
            colors: {
                primary: {
                    DEFAULT: "#FD4F00",
                    light: "#FF6A26",
                    dark: "linear-gradient(to bottom, #61C2FF, #FFFFFF)",
                },
                secondary: {
                    DEFAULT: "#BC2356", // Digi Warehouse pink-red
                    light: "#E93B74",
                    dark: "#7A1035",
                },
                accent: {
                    DEFAULT: "#D4793D", // Sumaya luxury tone
                },
                champagne: {
                    DEFAULT: "#F7E7CE", // Klar’s luxury champagne gold
                },
                midnight: {
                    DEFAULT: "#0A0A0A", // premium black base
                },
                neutral: {
                    50: "#FAFAFA",
                    100: "#F5F5F5",
                    200: "#E5E5E5",
                    300: "#D4D4D4",
                    400: "#A3A3A3",
                    500: "#737373",
                    600: "#525252",
                    700: "#404040",
                    800: "#262626",
                    900: "#171717",
                },
            },
        },
    },
    plugins: [],
};
