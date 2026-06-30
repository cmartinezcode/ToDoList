const registerButton = document.getElementById("registerButton");
const username = document.getElementById("username");
const password = document.getElementById("password");
const passwordConfirm = document.getElementById("passwordConfirm");
const eyeIcon = document.getElementById("eyeIcon");
const eyeIconConfirm = document.getElementById("eyeIconConfirm");
const userCreated = document.getElementById("userCreated");
const modalCreateUser = document.getElementById("modalCreateUser");
const modalErrorPassword = document.getElementById("modalErrorPassword");
const notPassword = document.getElementById("notPassword");
const modalErrorServer = document.getElementById("modalErrorServer");
const closeErrorServer = document.getElementById("closeErrorServer");
const titleErrorServer = document.getElementById("titleErrorServer");
const messageErrorServer = document.getElementById("messageErrorServer");
const iconErrorServer = document.getElementById("iconErrorServer");

closeErrorServer.addEventListener("click", () => {
	modalErrorServer.classList.add("hidden");
	modalErrorServer.classList.remove("flex");
});

eyeIcon.addEventListener("click", () => {
	eyeIcon.classList.toggle("fa-eye");
	eyeIcon.classList.toggle("fa-eye-slash");
	password.type = password.type === "password" ? "text" : "password";
});

eyeIconConfirm.addEventListener("click", () => {
	eyeIconConfirm.classList.toggle("fa-eye");
	eyeIconConfirm.classList.toggle("fa-eye-slash");
	passwordConfirm.type = passwordConfirm.type === "password" ? "text" : "password";
});

function showServerError(title, message, isWarning = false) {
	titleErrorServer.textContent = title;
	messageErrorServer.textContent = message;
	iconErrorServer.className = isWarning
		? "fa-solid fa-triangle-exclamation text-yellow-500 text-3xl"
		: "fa-solid fa-circle-exclamation text-red-600 text-3xl";
	modalErrorServer.classList.remove("hidden");
	modalErrorServer.classList.add("flex");
}

function mapRegisterError(message) {
	if (message === "El usuario está ocupado") {
		showServerError("Usuario en uso", "El nombre de usuario ya está registrado. Por favor, elige otro.");
	} else if (message === "Error interno del servidor") {
		showServerError("Error del servidor", "Ocurrió un error inesperado. Inténtalo de nuevo más tarde.");
	} else {
		showServerError("Datos inválidos", message, true);
	}
}

async function sendDataUser() {
	if (password.value !== passwordConfirm.value) {
		modalErrorPassword.classList.remove("hidden");
		modalErrorPassword.classList.add("flex");
		return;
	}

	try {
		const response = await axios.post(`${CONFIG.API_URL}/register`, {
			username: username.value,
			password: password.value,
		});
		username.value = "";
		password.value = "";
		username.focus();
		modalCreateUser.classList.remove("hidden");
		modalCreateUser.classList.add("flex");
	} catch (error) {
		if (error.response) {
			mapRegisterError(error.response.data.message);
		}
		username.focus();
	}
}

window.onload = () => {
	username.focus();
};

userCreated.addEventListener("click", () => {
	window.location.replace("login.html");
});

notPassword.addEventListener("click", () => {
	modalErrorPassword.classList.add("hidden");
	modalErrorPassword.classList.remove("flex");
});
