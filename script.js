// DateTime Display
function updateDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    const formattedDateTime = now.toLocaleString('ko-KR', options)
        .replace(/\./g, '')
        .replace(/\s+/g, ' ');
    document.getElementById('current-datetime').textContent = formattedDateTime;
}

// Update time every minute
updateDateTime();
setInterval(updateDateTime, 60000);

// Weather Information
async function updateWeather() {
    try {
        // 실제 프로덕션에서는 서버를 통해 날씨 API를 호출해야 합니다
        // 여기서는 예시 데이터를 사용합니다
        const weatherData = {
            temp: '22°C',
            desc: '맑음',
            icon: 'wi-day-sunny'
        };

        document.getElementById('temperature').textContent = weatherData.temp;
        document.getElementById('weather-desc').textContent = weatherData.desc;
        document.getElementById('weather-icon').className = `wi ${weatherData.icon}`;
    } catch (error) {
        console.error('날씨 정보를 가져오는데 실패했습니다:', error);
    }
}

// Update weather every 30 minutes
updateWeather();
setInterval(updateWeather, 1800000);

// Initialize Calendar with Todo Integration
let selectedDate = new Date().toISOString().split('T')[0];

const calendar = flatpickr("#calendar", {
    locale: 'ko',
    inline: true,
    dateFormat: "Y-m-d",
    onChange: function(selectedDates, dateStr) {
        selectedDate = dateStr;
        renderTodos();
    }
});

// DOM Elements
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodo');
const todoList = document.getElementById('todoList');

// Load todos from localStorage
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Render todos for selected date
function renderTodos() {
    todoList.innerHTML = '';
    const filteredTodos = todos.filter(todo => todo.date.startsWith(selectedDate));
    
    filteredTodos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn">삭제</button>
        `;

        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => confirmDelete(todo.id));

        todoList.appendChild(li);
    });
}

// Add new todo with SweetAlert2
async function addTodo(text) {
    if (text.trim() === '') {
        await Swal.fire({
            title: '알림',
            text: '할 일을 입력해주세요!',
            icon: 'warning',
            confirmButtonText: '확인',
            confirmButtonColor: '#3b82f6'
        });
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        date: selectedDate
    };

    todos.push(newTodo);
    saveTodos();

    await Swal.fire({
        title: '성공!',
        text: '새로운 할 일이 추가되었습니다.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
    });

    todoInput.value = '';
    renderTodos();
}

// Toggle todo completion
async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        const status = todo.completed ? '완료' : '미완료';
        
        await Swal.fire({
            title: `할 일 ${status}`,
            icon: 'info',
            timer: 1000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });

        saveTodos();
        renderTodos();
    }
}

// Confirm delete with SweetAlert2
async function confirmDelete(id) {
    const result = await Swal.fire({
        title: '정말 삭제하시겠습니까?',
        text: '이 작업은 되돌릴 수 없습니다!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
        
        await Swal.fire({
            title: '삭제완료!',
            text: '할 일이 삭제되었습니다.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    }
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Event Listeners
addTodoBtn.addEventListener('click', () => addTodo(todoInput.value));

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo(todoInput.value);
    }
});

// Initial render
renderTodos();
