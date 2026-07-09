const token = localStorage.getItem("token");

if (!token) {
	window.location.replace("login.html");
}

function logout() {
	localStorage.removeItem("token");
	window.location.replace("login.html");
}

let loading = false;
let allTasks = [];
let taskDuplicated = false;
const createTaskButton = document.getElementById("createTaskButton");
const cancelModal = document.getElementById("cancelModal");
const acceptModal = document.getElementById("acceptModal");
const taskText = document.getElementById("taskText");
let idTaskDelete = null;


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
		icon: '<i class="fa-solid fa-circle-exclamation text-red-500 text-2xl"></i>',
		title: "Error del servidor",
		message: "",
		cancelView: false,
	},
];


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

function showServerErrorModal(error) {
	if (error.response) {
		if (error.response.status === 401 || error.response.status === 403) {
			localStorage.removeItem("token");
			window.location.replace("login.html");
			return;
		}
		const msg = error.response.data.message || "Error desconocido";
		mesgModal[5].message = msg;
		renderModal(mesgModal[5], false, closeModal);
	}
}

function displayUsername() {
	const token = localStorage.getItem("token");
	if (token) {
		try {
			const payload = JSON.parse(atob(token.split(".")[1]));
			document.getElementById("usernameDisplay").textContent = payload.username;
		} catch (e) {
			// token inválido, ignorar
		}
	}
}

function escapeHTML(str) {
	const div = document.createElement("div");
	div.textContent = str;
	return div.innerHTML;
}

function renderTasks(tasks) {
	const list = document.getElementById("taskList");
	list.innerHTML = "";

	tasks.forEach((task) => {
		const li = document.createElement("li");

		li.className =
			"flex items-center justify-between bg-[#eff6f6] p-2 rounded-lg shadow-sm";

		const nameSpan = document.createElement("span");
		nameSpan.className = `flex-1 min-w-0 break-words text-xl text-gray-800 ${task.status ? "line-through opacity-50" : ""}`;
		nameSpan.textContent = task.name;

		const actionsDiv = document.createElement("div");
		actionsDiv.className = "flex shrink-0  gap-4";

		const editIcon = document.createElement("i");
		editIcon.className =
			"fa-solid fa-pen text-gray-600 cursor-pointer rounded text-lg";
		editIcon.addEventListener("click", () =>
			editTask(task.id, task.name, task.status),
		);

		const checkIcon = document.createElement("i");
		checkIcon.className =
			"fa-solid fa-check text-gray-600 cursor-pointer rounded text-lg";
		checkIcon.addEventListener("click", () =>
			completeTask(task.id, task.name, task.status),
		);

		const deleteIcon = document.createElement("i");
		deleteIcon.className =
			"fa-regular fa-trash-can text-gray-600 cursor-pointer rounded text-lg";
		deleteIcon.addEventListener("click", () => {
			confirmDeleteTask(task.id);
			renderModal(mesgModal[1], true, deleteTask);
		});

		actionsDiv.appendChild(editIcon);
		actionsDiv.appendChild(checkIcon);
		actionsDiv.appendChild(deleteIcon);

		li.appendChild(nameSpan);
		li.appendChild(actionsDiv);

		list.appendChild(li);
	});
}


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

		taskText.value = ""; 
		await getTasks(); 
		taskText.focus();
	} catch (error) {
		showServerErrorModal(error);
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
		showServerErrorModal(error);
	} finally {
		loading = false;
	}
}

function filterPendingTasks() {
	const pendingTasks = allTasks.filter((task) => {
		return task.status === false; // si uso {} debo retornar si no, puedo quitar el return
	});
	renderTasks(pendingTasks);
}

function filterCompletedTasks() {
	const completedTasks = allTasks.filter((task) => {
		return task.status; // si uso {} debo retornar si no, puedo quitar el return
	});
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
		await getTasks();
	} catch (error) {
		showServerErrorModal(error);
	}
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
	} catch (error) {
		showServerErrorModal(error);
	}
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
			await getTasks();
			closeModal();
			return;
		} catch (error) {
			showServerErrorModal(error);
		}
	}
}

window.onload = () => {
	displayUsername();
	getTasks();
	taskText.focus();
};

taskText.addEventListener("keydown", (e) => {
	if (e.key === "Enter") {
		createTask();
	}
});

