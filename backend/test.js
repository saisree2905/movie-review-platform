const https = require('https');

https.get('https://api.themoviedb.org/3/genre/movie/list?api_key=aeaec8bfb02b1dd5408337b8df1ef500', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', (err) => console.error('Error:', err));
