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
    promoted_urls: [ "covid-19" ],
    promoted_questions: {
        "covid-19": "What do we know about COVID-19 risk factors?"
    },
    promoted_data: {
        "covid-19": [
            {text: "What is known about transmission, incubation, and environmental stability of Covid-19?"},
            {text: "What do we know about COVID-19 risk factors?"},
            {text: "What do we know about virus genetics, origin, and evolution og Covid-19?"},
            {text: "What do we know about non-pharmaceutical interventions for Covid-19?"},
            {text: "What do we know about vaccines and therapeutics for Covid-19?"}
        ]
    }
}
