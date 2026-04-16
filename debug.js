const url = "https://meozpzfewyuxeoerwycz.supabase.co/rest/v1/predictions?select=*";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lb3pwemZld3l1eGVvZXJ3eWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDc5MzIsImV4cCI6MjA5MTY4MzkzMn0.czBobdrP5gquvIfpm3tP8cSGc9JQLe1wFHTQOX2MXqI";

fetch(url, { headers: { apikey: key, Authorization: "Bearer " + key } })
  .then(r => r.json())
  .then(preds => {
      const winners = [...new Set(preds.map(p => p.predicted_winner))];
      console.log("Unique predicted winners:", winners);
  });
