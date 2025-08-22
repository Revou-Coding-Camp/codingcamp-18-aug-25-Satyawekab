// js/script.js
class TodoApp {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('colorfulTasks')) || [];
    this.currentFilter = 'all';
    this.taskIdCounter =
      this.tasks.length > 0 ? Math.max(...this.tasks.map((t) => t.id)) + 1 : 1;

    this.init();
  }

  init() {
    this.bindEvents();
    this.setMinDate();
    this.renderTasks();
    this.updateStats();
  }

  bindEvents() {
    // Form submission
    document.getElementById('todoForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTask();
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.setActiveFilter(e.target);
        this.currentFilter = e.target.dataset.filter;
        this.renderTasks();
      });
    });

    // Real-time validation
    document.getElementById('taskInput').addEventListener('input', () => {
      this.validateTaskInput();
    });

    document.getElementById('dateInput').addEventListener('change', () => {
      this.validateDateInput();
    });
  }

  setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateEl = document.getElementById('dateInput');
    if (dateEl) dateEl.min = today;
  }

  validateTaskInput() {
    const taskInput = document.getElementById('taskInput');
    const errorEl = document.getElementById('taskError');
    const task = taskInput.value.trim();

    if (task.length === 0) {
      errorEl.textContent = '';
      return false;
    }

    if (task.length < 3) {
      errorEl.textContent = 'Task must be at least 3 characters long';
      return false;
    }

    if (this.isDuplicateTask(task)) {
      errorEl.textContent = 'This task already exists';
      return false;
    }

    errorEl.textContent = '';
    return true;
  }

  validateDateInput() {
    const dateInput = document.getElementById('dateInput');
    const errorEl = document.getElementById('dateError');
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!dateInput.value) {
      errorEl.textContent = 'Please select a due date';
      return false;
    }

    if (selectedDate < today) {
      errorEl.textContent = 'Due date cannot be in the past';
      return false;
    }

    errorEl.textContent = '';
    return true;
  }

  isDuplicateTask(taskText) {
    return this.tasks.some(
      (task) => task.text.toLowerCase() === taskText.toLowerCase() && !task.completed
    );
  }

  addTask() {
    const taskInput = document.getElementById('taskInput');
    const dateInput = document.getElementById('dateInput');

    const isTaskValid = this.validateTaskInput();
    const isDateValid = this.validateDateInput();

    if (!isTaskValid || !isDateValid) {
      this.shakeForm();
      return;
    }

    const task = {
      id: this.taskIdCounter++,
      text: taskInput.value.trim(),
      date: dateInput.value,
      completed: false,
      createdAt: new Date().toISOString(),
      priority: this.calculatePriority(dateInput.value),
    };

    this.tasks.push(task);
    this.saveTasks();
    this.renderTasks();
    this.updateStats();
    this.resetForm();
    this.showSuccessMessage();
  }

  calculatePriority(dateStr) {
    const taskDate = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = taskDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'high';
    if (diffDays <= 7) return 'medium';
    return 'low';
  }

  toggleTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.renderTasks();
      this.updateStats();
    }
  }

  deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.tasks = this.tasks.filter((t) => t.id !== taskId);
      this.saveTasks();
      this.renderTasks();
      this.updateStats();
    }
  }

  getFilteredTasks() {
    const today = new Date().toISOString().split('T')[0];

    switch (this.currentFilter) {
      case 'today':
        return this.tasks.filter((task) => task.date === today);
      case 'upcoming':
        return this.tasks.filter((task) => task.date > today && !task.completed);
      case 'completed':
        return this.tasks.filter((task) => task.completed);
      default:
        return this.tasks;
    }
  }

  renderTasks() {
    const tasksList = document.getElementById('tasksList');
    if (!tasksList) return;

    const filteredTasks = this.getFilteredTasks();
  
    if (filteredTasks.length === 0) {
      tasksList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <p>No tasks found for this filter.</p>
        </div>
      `;
      return;
    }

    tasksList.innerHTML = filteredTasks
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((task) => this.cr)
  }
}  