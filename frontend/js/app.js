const IP_SERVER = "192.168.1.4";
let loading = false;
let allTasks = [];
let currentFilter = "all";
const createTaskButton = document.getElementById("createTaskButton");

const modalEdit = document.getElementById("modalEditTask");
const editTaskInput = document.getElementById("editTaskInput");
const modalButtonGuardar = document.getElementById("modalButtonGuardar");
const modalButtonCancelar = document.getElementById("modalButtonCancelar");
const buttonsModal = document.getElementById("buttonsModal");

const alertalertStatus = document.getElementById("alertStatus");
const msgAlert = document.getElementById("msgAlert");
const alertOk = document.getElementById("alertOk");

const taskText = document.getElementById("taskText");
const cancelarAlert = document.getElementById("cancelarAlert");

function generateMsgAlert(msg) {
  alertalertStatus.classList.replace("opacity-0", "opacity-100");
  alertalertStatus.classList.replace(
    "pointer-events-none",
    "pointer-events-auto",
  );
  msgAlert.textContent = "";
  msgAlert.textContent = msg;
}
cancelarAlert.addEventListener("click", () => {
  taskText.focus();
  alertalertStatus.classList.replace("opacity-100", "opacity-0");
  alertalertStatus.classList.replace(
    "pointer-events-auto",
    "pointer-events-none",
  );
});

alertOk.addEventListener("click", () => {
  taskText.focus();
  alertalertStatus.classList.replace("opacity-100", "opacity-0");
  alertalertStatus.classList.replace(
    "pointer-events-auto",
    "pointer-events-none",
  );
});

async function createTask() {
  if (taskText.value === "") {
    generateMsgAlert("La tarea no puede estar vacia!");
    return;
  }

  try {
    const task = taskText.value;
    const response = await axios.post(`http://${IP_SERVER}:3000/tasks`, {
      name: task,
    });

    console.log("mensaje:", response.data.message); // mostrar respuesta del backend

    taskText.value = ""; // formateamos el input
    await getTasks(); // esperamos las tareas nuevamente
    taskText.focus();
  } catch (error) {
    console.error("error:", error);
  }
}

createTaskButton.addEventListener("click", createTask);

async function getTasks() {
  if (loading) return;
  try {
    loading = true;
    const { data: tasks, error: error } = await axios.get(
      `http://${IP_SERVER}:3000/tasks`,
    );
    renderTasks(tasks); // paso como parametro el array de la respuesta de get y dibujo las tareas
    return (allTasks = tasks); // guardo todas las tareas en un variable global
  } catch (error) {
    console.error(error);
  } finally {
    loading = false;
  }
}


function renderTasks(tasks) {
  taskText.focus();
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");

    li.className =
      "flex items-center justify-between bg-gray-50 p-2 rounded-lg shadow-sm";

    li.innerHTML = `
        <span class="text-xl text-gray-800 ${task.status ? "line-through opacity-50" : ""}">${task.name}</span>
        <div class="flex gap-4">
        <svg 
            class="text-gray-600 cursor-pointer rounded w-6 h-6" 
            onclick='editTask(${task.id} , ${JSON.stringify(task.name)}, ${task.status})' >
            <use href="../dist/symbol/svg/sprite.css.svg#edit-3"></use>
        </svg>

        <svg 
          class="text-gray-600 cursor-pointer rounded w-6 h-6"
          onclick='completeTask(${task.id} , ${JSON.stringify(task.name)}, ${task.status})' >
          <use href="../dist/symbol/svg/sprite.css.svg#check"></use> 
        </svg>
        
        <svg 
            class="text-gray-600 cursor-pointer rounded w-6 h-6" 
            onclick="deleteTask(${task.id})" >
            <use href="../dist/symbol/svg/sprite.css.svg#trash-2"></use>
        </svg>
        </div>
      `;

    list.appendChild(li);
  });
}

function filterPendingTasks() {
  console.log("filtrando tareas pendientes...");
  const pendingTasks = allTasks.filter((task) => {
    return task.status === false; // si uso {} debo retornar si no, puedo quitar el return
  });
  console.log(pendingTasks);
  renderTasks(pendingTasks);
}

function filterCompletedTasks() {
  console.log("filtrando tareas completas...");
  const completedTasks = allTasks.filter((task) => {
    return task.status; // si uso {} debo retornar si no, puedo quitar el return
  });
  console.log(completedTasks);
  renderTasks(completedTasks);
}

async function deleteTask(id) {
  generateMsgAlert("Deseas eliminar esta tarea?");
  alertOk.addEventListener(
    "click",
    async () => {
      try {
        const response = await axios.delete(
          `http://${IP_SERVER}:3000/tasks/${id}`,
        );
        console.log(response.data.message);
        await getTasks();
      } catch (error) {}
    },
    { once: true },
  );
}

async function completeTask(id, name, status) {
  if (status === true) {
    generateMsgAlert("Esta tarea ya esta completada!");
    return;
  }
  try {
    status = true;
    const response = await axios.put(`http://${IP_SERVER}:3000/tasks/${id}`, {
      name,
      status,
    });
    await getTasks();
  } catch (error) {}
}

function cerrarModal() {
  modalEdit.classList.replace("opacity-100", "opacity-0");
  modalEdit.classList.replace("pointer-events-auto", "pointer-events-none");

  buttonsModal.classList.replace("pointer-events-auto", "pointer-events-none");

  editTaskInput.value = "";
  return;
}

async function editTask(id, name, status) {
  if (status) {
    generateMsgAlert("Esta tarea no se puede editar!");
    return;
  }
  modalEdit.classList.replace("opacity-0", "opacity-100");
  modalEdit.classList.replace("pointer-events-none", "pointer-events-auto");

  buttonsModal.classList.replace("pointer-events-none", "pointer-events-auto");
  editTaskInput.value = name;
  editTaskInput.focus();

  modalButtonCancelar.onclick = () => {
    cerrarModal();
    return;
  };

  modalButtonGuardar.onclick = async () => {
    try {
      status = false;
      name = editTaskInput.value;
      const response = await axios.put(`http://${IP_SERVER}:3000/tasks/${id}`, {
        name,
        status,
      });
      editTaskInput.value = "";
      console.log("tarea editada exitosamente");
      await getTasks();
      cerrarModal();
      return;
    } catch (error) {}
  };
}

window.onload = () => {
  getTasks();
  taskText.focus();
};

taskText.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    createTask();
  }
});

// setInterval(getTasks, 5000); interfiere con el filtro
