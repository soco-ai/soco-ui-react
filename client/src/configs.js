console.log(process.env.NODE_ENV);

export const botmakerUrl = process.env.BOT_URL;
// You can use serverUrl for your self-defined node.js api. Define your server url when you deploy the page online
export const serverUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3031' : process.env.BACKEND_URL;
export const socoUrl = process.env.SOCO_URL;
export const colors = [
    "#C33C54", "#254E70", "#F26419", "#F6AE2D", "#86BBD8", 
    "#2F4858", "#A997DF", "#F7996E", "#4C9F70", "#254E70", 
    "#918EF4", "#6F9CEB", "#59C3C3", "#A663CC", "#BEB7A4", 
    "#7EB2DD", "#EF767A", "#EEB868"
];
export const example = {
    promoted_question: "How many coronavirus cases in the world?",
    promoted_data: [
        {text: "How many coronavirus cases in the world?"},
        {text: "Covid-19 medication update"},
        {text: "How many cases have there been in the US?"},
        {text: "How many deaths have there been in the US?"},
        {text: "What did Trump say today?"},
        {text: "What did CDC say?"}
    ]
}
