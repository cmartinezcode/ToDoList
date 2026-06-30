const isLocal =
	window.location.hostname === "localhost" ||
	window.location.hostname === "127.0.0.1";

const CONFIG = {
	API_URL: isLocal ? "http://localhost:5000" : "https://todolist-euh0.onrender.com",
};
