const loginButton = document.getElementById("loginButton");
const username = document.getElementById("username");
const password = document.getElementById("password");
const eyeIcon = document.getElementById("eyeIcon");
const modalErrorLogin = document.getElementById("modalErrorLogin");
const closeErrorLogin = document.getElementById("closeErrorLogin");
const titleErrorLogin = document.getElementById("titleErrorLogin");
const messageErrorLogin = document.getElementById("messageErrorLogin");
const iconErrorLogin = document.getElementById("iconErrorLogin");

closeErrorLogin.addEventListener("click", () => {
	modalErrorLogin.classList.add("hidden");
	modalErrorLogin.classList.remove("flex");
});

eyeIcon.addEventListener("click", () => {
	eyeIcon.classList.toggle("fa-eye");
	eyeIcon.classList.toggle("fa-eye-slash");
	password.type = password.type === "password" ? "text" : "password";
});

function showErrorModal(title, message, isWarning = false) {
	titleErrorLogin.textContent = title;
	messageErrorLogin.textContent = message;
	iconErrorLogin.className = isWarning
		? "fa-solid fa-triangle-exclamation text-yellow-500 text-3xl"
		: "fa-solid fa-circle-exclamation text-red-600 text-3xl";
	modalErrorLogin.classList.remove("hidden");
	modalErrorLogin.classList.add("flex");
}

function mapLoginError(status, message) {
	if (status === 429) {
		showErrorModal("Demasiados intentos", message, true);
	} else if (message === "El usuario no existe") {
		showErrorModal("Usuario no encontrado", message);
	} else if (message === "Contraseña inválida") {
		showErrorModal("Contraseña incorrecta", message);
	} else if (message === "Error interno del servidor") {
		showErrorModal("Error del servidor", message);
	} else {
		showErrorModal("Datos inválidos", message, true);
	}
}

async function sendDataUser() {
	try {
		const response = await axios.post(`${CONFIG.API_URL}/login`, {
			username: username.value,
			password: password.value,
		});
		username.value = "";
		password.value = "";
		if (response.data.success) {
			localStorage.setItem("token", response.data.token);
			window.location.replace("app.html");
		}
	} catch (error) {
		if (error.response) {
			mapLoginError(error.response.status, error.response.data.message);
			password.value = "";
			password.focus();
		}
	}
}

window.onload = () => {
	username.focus();
};
