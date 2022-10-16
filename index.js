import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import express, { json } from 'express';

const app = express();
// make app .body work
app.use(express.json());
const db = await sqlite.open({
    filename: './data_plan.db',
    driver: sqlite3.Database
});

const PORT = 6090;
app.listen(PORT, () => {
    console.log(`price Plans API started on port ${PORT}`);
})


// .then ({} => {
console.log('db.initialize');

await db.migrate();

app.post('/api/price_plan/update', async function (req, res) {

    console.log(req.body)

    const { sms_price,
        call_price,
        price_plan } = req.body;


    const result = await db.run(`UPDATE price_plan set sms_price = ?, 
                                  call_price = ? where plan_name = ?`,
        sms_price,
        call_price,
        price_plan);

        console.log(result)

    res.json({
        status: 'successful'
    })


});


app.get('/api/price_plans', async function (req, res) {
    const price_plans = await db.all('select * from price_plan');
    res.json({
        price_plans
    })

});

app.post('/api/phonebill', async function (req, res) {

    //console.log(req.body);

    //get the prize plan to use
    const price_plan_name = req.body.price_plan

    const price_plan = await db.get(`SELECT id, plan_name, sms_price, call_price
        FROM price_plan where plan_name = ?`, price_plan_name);

    if (!price_plan) {
        res.json({
            error: `Invalid price plan name : ${price_plan_name}`
        });
    } else {
        const activity = req.body.actions;

        const activities = activity.split(",");
        let total = 0;

        activities.forEach(action => {
            if (action.trim() === 'sms') {
                total += price_plan.sms_price;
            } else if (action.trim() == 'call') {
                total += price_plan.call_price;

            }

        });
        res.json({
            total
        })
    }


});