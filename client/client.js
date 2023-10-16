const handleResponse = async (response) => {
  //Do the do
}

const sendFetch = async (url) => {
  const response = await fetch(url);
  handleResponse(response);
};

const init = () => {
  // Set all buttons to send fetch requests
}

window.onload = init;