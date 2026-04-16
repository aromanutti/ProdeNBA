const url = "https://meozpzfewyuxeoerwycz.supabase.co/rest/v1/predictions?predicted_winner=eq.GS";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lb3pwemZld3l1eGVvZXJ3eWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDc5MzIsImV4cCI6MjA5MTY4MzkzMn0.czBobdrP5gquvIfpm3tP8cSGc9JQLe1wFHTQOX2MXqI";

fetch(url, { 
  method: 'PATCH',
  headers: { 
    apikey: key, 
    Authorization: "Bearer " + key,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ predicted_winner: "GSW" })
})
.then(r => r.text())
.then(console.log);
