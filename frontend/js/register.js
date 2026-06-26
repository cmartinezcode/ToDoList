const registerButton = document.getElementById("registerButton");
const username = document.getElementById("username");
const password = document.getElementById("password");
const passwordConfirm = document.getElementById("passwordConfirm");
const eyeIcon = document.getElementById("eyeIcon");
const userCreated = document.getElementById("userCreated");
const modalCreateUser = document.getElementById("modalCreateUser");
const modalErrorPassword = document.getElementById("modalErrorPassword");
const notPassword = document.getElementById("notPassword");

eyeIcon.addEventListener("click", () => {
  eyeIcon.classList.toggle("fa-eye");
  eyeIcon.classList.toggle("fa-eye-slash");
});

async function sendDataUser() {
  if (password.value != passwordConfirm.value) {
    modalErrorPassword.classList.remove("hidden");
    modalErrorPassword.classList.add("flex");
    return console.log("Las password no considen");
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
      //alert(error.response.data.message);
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
