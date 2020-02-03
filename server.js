const express = require('express');
const rp = require('request-promise');
const Email = require('email-templates');

const app = express();
const port = 3000;
const mailer = new Email({
    message: {
        from: 'info@gmail.com'
    },
    transport: {
        jsonTransport: true
    }
});


app.get('/', (req, res) => res.send('Hello!'));

app.get('/forecast', (req, res) => {
    rp('https://api.openweathermap.org/data/2.5/weather?q=Budapest,hu&appid=0dd156b1dcede69fcd0ef7501a0132d8')
        .then((weatherString) => {
            let { main } = JSON.parse(weatherString);
            let temperature = Math.floor(((main.temp - 273.15) * 100) / 100);
            
            res.send({temperature: temperature});
        })
        .catch(function (err) {
            res.send("OOPS");
        });
});

app.get('/forecast/:city', (req, res) => {
    const { city } = req.params;

    rp(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=0dd156b1dcede69fcd0ef7501a0132d8`)
        .then((weatherString) => {
            let { main } = JSON.parse(weatherString);
            let temperature = Math.floor(((main.temp - 273.15) * 100) / 100);
            
            res.send({temperature: temperature});
        })
        .catch((err) => {
            res.send("OOPS");
        });
});

app.get('/forecast/:city/:email', async (req, res) => {
    const { city, email } = req.params;
    const emailRegex = new RegExp(/\S+@\S+\.\S+/);

    if (!emailRegex.test(email)) {
        res.send("Hibás email.");
    } else {
        rp(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=0dd156b1dcede69fcd0ef7501a0132d8`)
        .then((weatherString) => {
            let { main } = JSON.parse(weatherString);
            let temperature = Math.floor(((main.temp - 273.15) * 100) / 100);

            mailer
                .send({
                    template: 'weather',
                    message: {
                        to: email
                    },
                    locals: {
                        city: city,
                        temperature: temperature
                    }
                })
                .then(() => {
                    res.send("Siker.");
                })
                .catch(() => {
                    res.send("Hiba.");
                });
        })
        .catch((err) => {
            res.send("OOPS");
        });
    }    
})

app.listen(port, () => console.log(`App listening on port ${port}!`));