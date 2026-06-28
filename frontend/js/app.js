/*
 * Declaracion de variables globales
 */

const token = localStorage.getItem("token");
let loading = false;
let allTasks = [];
let taskDuplicated = false;
const createTaskButton = document.getElementById("createTaskButton");
const cancelModal = document.getElementById("cancelModal");
const acceptModal = document.getElementById("acceptModal");
const taskText = document.getElementById("taskText");
let idTaskDelete = null;

/*
 * Array mensajes de modal
 */

let mesgModal = [
  {
    icon: '<i class="fa-solid fa-triangle-exclamation text-yellow-500 text-2xl"></i>',
    title: "!Tarea invalida!",
    message: "La tarea no puede estar vacia o  tener  menos de 3 caracteres.",
    cancelView: false,
  },
  {
    icon: '<i class="fa-solid fa-trash-can text-red-500 text-2xl"></i>',
    title: "¿Eliminar tarea?",
    message:
      "¿Esta seguro que desea eliminar esta tarea? Esta accion no se puede retroceder.",
    cancelView: false,
  },
  {
    icon: '<i class="fa-solid fa-triangle-exclamation text-yellow-500 text-2xl"></i>',
    title: "Tarea completada",
    message:
      "!Esta tarea ya fue completada! Por favor, cree una nueva tarea o elimine esta.",
    cancelView: false,
  },
  {
    icon: '<i class="fa-solid fa-pen-clip text-cyan-800 text-2xl"></i>',
    title: "Editar tarea",
    message: "Ingrese el nuevo nombre de la tarea:",
    cancelView: false,
  },
  {
    icon: '<i class="fa-solid fa-clone text-orange-600 text-2xl"></i>',
    title: "Tarea existente",
    message: "Esta tarea ya existe, cree otra tarea o elimine la ya existente",
    cancelView: false,
  },

  {
    icon: '<i class="fa-solid fa-cat text-gray-700/75 text-2xl md:text-3xl"></i>',
    title: "App de tareas",
    message:
      'Esta aplicacion ha sido desarrollada por <a href="https://github.com/cmartinezcode/ToDoList.git" class="text-cyan-700 font-bold" target="_blank">Cristian Martinez</a> , bajo la licencia MIT.',
    cancelView: false,
  },
];

/*
 * Funciones
 */

const modal = document.getElementById("modal");

function renderModal(nModal, cancelView, accion) {
  if (!cancelView) {
    document.getElementById("cancelModal").classList.add("hidden");
  }
  document.getElementById("iconModal").innerHTML = nModal.icon;
  document.getElementById("titleModal").innerHTML = nModal.title;
  document.getElementById("messageModal").innerHTML = nModal.message;
  document.getElementById("acceptModal").onclick = accion;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModal() {
  taskText.focus();
  document.getElementById("cancelModal").classList.remove("hidden");
  document.getElementById("inputTaskName").classList.add("hidden");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function renderTasks(tasks) {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");

    li.className =
      "flex items-center justify-between bg-gray-50 p-2 rounded-lg shadow-sm";

    li.innerHTML = `
        <span class="text-xl text-gray-800 ${task.status ? "line-through opacity-50" : ""}">${task.name}</span>
        <div class="flex gap-4">
        
        <i 
          class="fa-solid fa-pen text-gray-600 cursor-pointer rounded text-lg"
          onclick='editTask(${task.id} , ${JSON.stringify(task.name)}, ${task.status})'  
        ></i>
        
        <i 
          class="fa-solid fa-check text-gray-600 cursor-pointer rounded text-lg"
          onclick='completeTask(${task.id} , ${JSON.stringify(task.name)}, ${task.status})'
        ></i>

        <i 
          class="fa-regular fa-trash-can text-gray-600 cursor-pointer rounded text-lg"
          onclick="confirmDeleteTask(${task.id}); renderModal(mesgModal[1], true, deleteTask)"   
        ></i>

        </div>
      `;

    list.appendChild(li);
  });
}

/*Mostrar modal con metodo toggle */

/*
 * Funciones asincronas al servidor
 */

function verificedTaskDuplicate() {
  renderModal(mesgModal[4], false, closeModal);
  taskDuplicated = false;
  return;
}

async function createTask() {
  if (taskText.value.length < 3) {
    renderModal(mesgModal[0], false, closeModal);
    return;
  }

  for (const task of allTasks) {
    if (taskText.value === task.name) {
      taskDuplicated = true;
      verificedTaskDuplicate();
      return;
    }
  }

  try {
    const task = taskText.value;

    const response = await axios.post(
      `${CONFIG.API_URL}/tasks`,
      {
        name: task,
        status: false,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

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
    const { data: tasks } = await axios.get(`${CONFIG.API_URL}/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    renderTasks(tasks); // paso como parametro el array de la respuesta de get y dibujo las tareas
    return (allTasks = tasks); // guardo todas las tareas en un variable global
  } catch (error) {
    console.error(error);
  } finally {
    loading = false;
  }
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

function confirmDeleteTask(id) {
  idTaskDelete = id;
}

async function deleteTask() {
  const id = idTaskDelete;
  try {
    const response = await axios.delete(`${CONFIG.API_URL}/tasks/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data.message);
    await getTasks();
  } catch (error) {}
  closeModal();
}

async function completeTask(id, name, status) {
  if (status) {
    renderModal(mesgModal[2], false, closeModal);
    return;
  }
  try {
    status = true;
    const response = await axios.put(
      `${CONFIG.API_URL}/tasks/${id}`,
      {
        name,
        status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    await getTasks();
  } catch (error) {}
}

async function editTask(id, name, status) {
  if (status) {
    renderModal(mesgModal[2], false, closeModal);
    return;
  }
  const input = document.getElementById("inputTaskName");

  input.classList.remove("hidden");
  renderModal(mesgModal[3], false, taskEdited);
  input.focus();

  async function taskEdited() {
    if (input.value === "") {
      closeModal();
      return;
    }

    for (const task of allTasks) {
      if (input.value === task.name) {
        taskDuplicated = true;
        closeModal();
        verificedTaskDuplicate();
        return;
      }
    }

    try {
      status = false;
      name = input.value;
      const response = await axios.put(
        `${CONFIG.API_URL}/tasks/${id}`,
        {
          name,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      input.value = "";
      console.log("tarea editada exitosamente");
      await getTasks();
      closeModal();
      return;
    } catch (error) {}
  }
}

window.onload = () => {
  getTasks();
  taskText.focus();
  renderModal(mesgModal[5], false, closeModal);
};

taskText.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    createTask();
  }
});

// setInterval(getTasks, 5000); interfiere con el filtro
