/**
 * Don't forget to set repository action secrets in your repository settings
 */
require('dotenv').config();
const Mustache = require('mustache');
const fetch = require('node-fetch');
const fs = require('fs');

const MUSTACHE_MAIN_DIR = `${__dirname}/main.mustache`;

/**
 * @returns {{refresh_date: string}}
 */
function getRefreshDate()
{
    return {
        refresh_date: new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            timeZone: 'Europe/Kiev',
        }),
    };
}

async function getWeatherInformation() {
    return fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=kharkiv&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`
    )
        .then(r => r.json())
        .then(r => {
            let refreshDate = getRefreshDate();
            let data = {
                ...refreshDate,
            };
            data.city = r.name;
            data.city_temp = Math.round(r.main.temp);
            data.city_temp_feels_like = Math.round(r.main.feels_like);
            data.city_weather = r.weather[0].description;
            data.city_weather_icon = r.weather[0].icon;
            data.sun_rise = new Date(r.sys.sunrise * 1000).toLocaleString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Europe/Kiev',
            });
            data.sun_set = new Date(r.sys.sunset * 1000).toLocaleString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Europe/Kiev',
            });

            return data;
        });
}

async function generateReadMe(data) {
    await fs.readFile(MUSTACHE_MAIN_DIR, (err, content) => {
            if (err) throw err;
            const output = Mustache.render(content.toString(), data);
            fs.writeFileSync('README.md', output);
        });
}

async function action() {

    /**
     * Fetches Weather and Generates README
     */
    await getWeatherInformation().then(generateReadMe);
}

action();