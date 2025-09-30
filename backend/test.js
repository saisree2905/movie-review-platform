const axios = require('axios');

axios.get('https://api.themoviedb.org/3/movie/popular', {
    params: { api_key: '4c77f725aafcc1f14f5c4640e4a597a9' }
}).then(res => console.log(res.data.results[0]))
  .catch(err => console.error(err.message));
