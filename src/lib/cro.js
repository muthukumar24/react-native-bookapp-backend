import cron from "cron";
import https from "https";
import 'dotenv/config';

const job = new cron.CronJob("*/14 * * * *", function () {
  https
    .get(process.env.API_URL, (res) => {
      if (res.statusCode == 200) {
        console.log("Get Request sent successfully");
      } else {
        console.log("Get Request Failed", res.statusCode);
      }
    })
    .on("error", (e) => console.log("Error While sending request", e));
});

export default job;
