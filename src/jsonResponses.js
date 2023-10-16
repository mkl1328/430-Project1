const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

//Not sure if needed
// const respondJSONMeta = (request, response, status) => {
//   response.writeHead(status, { 'Content-Type': 'application/json' });
//   response.end();
// };

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };
  return respondJSON(request, response, 404, responseJSON);
};

module.exports = {
  notFound,
}