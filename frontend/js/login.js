
const loginButton = document.getElementById("loginButton");
const username = document.getElementById("username");
const password = document.getElementById("password");
const eyeIcon = document.getElementById("eyeIcon");

eyeIcon.addEventListener("click", () => {
  eyeIcon.classList.toggle("fa-eye");
  eyeIcon.classList.toggle("fa-eye-slash");
});

async function sendDataUser() {
  try {
    console.log("click");
    console.log(CONFIG.API_URL);
    const response = await axios.post(`${CONFIG.API_URL}/login`, {
      username: username.value,
      password: password.value,
    });

    console.log("mensaje:", response.data.message); // mostrar respuesta del backend
    username.value = "";
    password.value = "";
    if (response.data.success) {
      // 💾 GUARDAR EL TOKEN EN EL NAVEGADOR
      localStorage.setItem("token", response.data.token);

      alert("¡Login exitoso!");
      window.location.replace("app.html");
    }
  } catch (error) {
    if(error.response){
      alert(error.response.data.message)
      password.value = "";
      password.focus();
    }
  }
}

window.onload = () => {
  username.focus();
};
