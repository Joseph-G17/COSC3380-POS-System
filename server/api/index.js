module.exports = (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.searchParams.get('path');

  if (path !== null) {
    url.searchParams.delete('path');
    const rest = url.searchParams.toString();
    req.url = '/api/' + path + (rest ? '?' + rest : '');
  }

  handler(req, res);
};

