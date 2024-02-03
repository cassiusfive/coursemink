/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            transitionProperty: {
                "max-height": "max-height",
            },
        },
    },
    plugins: ["prettier-plugin-tailwindcss"],
};
