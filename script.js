    let nextEmployeeId = 1;
    let nextProjectId = 1;

    function createEmployee(name, active = true) {
      return { id: "e" + nextEmployeeId++, name, active };
    }

    function createProject(name, active = true) {
      return { id: "p" + nextProjectId++, name, active };
    }

    const state = {
      employees: [createEmployee("Alice"), createEmployee("Bob"), createEmployee("Charlie")],
      projects: [createProject("Pixelate Furniture"), createProject("Project "), createProject("Spechaus")],
      entries: []
    };

    function init() {
      initEmployees();
      initProjects();
      initFilters();
      initDates();
      bindEvents();
      upgradeSelects();
      renderAll();
    }

    function getEmployeeById(id) {
      return state.employees.find(e => e.id === id) || null;
    }

    function getProjectById(id) {
      return state.projects.find(p => p.id === id) || null;
    }

    function initEmployees() {
      const employeeSelect = document.getElementById("employee");
      const filterEmployee = document.getElementById("filter-employee");
      const tableBody = document.querySelector("#employees-table tbody");
      employeeSelect.innerHTML = "";
      filterEmployee.innerHTML = '<option value="">All employees</option>';
      tableBody.innerHTML = "";

      state.employees.forEach(emp => {
        if (emp.active) {
          const opt1 = document.createElement("option");
          opt1.value = emp.id;
          opt1.textContent = emp.name;
          employeeSelect.appendChild(opt1);

          const opt2 = document.createElement("option");
          opt2.value = emp.id;
          opt2.textContent = emp.name;
          filterEmployee.appendChild(opt2);
        }

        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        nameCell.textContent = emp.name;
        if (!emp.active) {
          nameCell.classList.add("muted");
          const badge = document.createElement("span");
          badge.textContent = "Inactive";
          badge.className = "badge-inactive";
          nameCell.appendChild(badge);
        }
        const actionsCell = document.createElement("td");
        actionsCell.className = "actions-cell";

        const toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.className = "btn btn-ghost";
        toggleBtn.textContent = emp.active ? "Soft delete" : "Restore";
        toggleBtn.addEventListener("click", () => toggleEmployeeActive(emp.id));

        actionsCell.appendChild(toggleBtn);
        row.appendChild(nameCell);
        row.appendChild(actionsCell);
        tableBody.appendChild(row);
      });

      refreshCustomSelect("employee");
      refreshCustomSelect("filter-employee");
    }

    function initProjects() {
      const projectSelect = document.getElementById("project");
      const filterProject = document.getElementById("filter-project");
      const tableBody = document.querySelector("#projects-table tbody");
      projectSelect.innerHTML = "";
      filterProject.innerHTML = '<option value="">All projects</option>';
      tableBody.innerHTML = "";

      state.projects.forEach(proj => {
        if (proj.active) {
          const opt1 = document.createElement("option");
          opt1.value = proj.id;
          opt1.textContent = proj.name;
          projectSelect.appendChild(opt1);

          const opt2 = document.createElement("option");
          opt2.value = proj.id;
          opt2.textContent = proj.name;
          filterProject.appendChild(opt2);
        }

        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        nameCell.textContent = proj.name;
        if (!proj.active) {
          nameCell.classList.add("muted");
          const badge = document.createElement("span");
          badge.textContent = "Inactive";
          badge.className = "badge-inactive";
          nameCell.appendChild(badge);
        }
        const actionsCell = document.createElement("td");
        actionsCell.className = "actions-cell";

        const toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.className = "btn btn-ghost";
        toggleBtn.textContent = proj.active ? "Soft delete" : "Restore";
        toggleBtn.addEventListener("click", () => toggleProjectActive(proj.id));

        actionsCell.appendChild(toggleBtn);
        row.appendChild(nameCell);
        row.appendChild(actionsCell);
        tableBody.appendChild(row);
      });

      refreshCustomSelect("project");
      refreshCustomSelect("filter-project");
    }

    function toggleEmployeeActive(id) {
      const emp = getEmployeeById(id);
      if (!emp) return;
      if (emp.active) {
        const ok = confirm(`Soft delete employee "${emp.name}"? Existing entries will be kept, but this employee will be hidden from new logs.`);
        if (!ok) return;
        emp.active = false;
      } else {
        emp.active = true;
      }
      initEmployees();
      initFilters();
      renderAll();
    }

    function toggleProjectActive(id) {
      const proj = getProjectById(id);
      if (!proj) return;
      if (proj.active) {
        const ok = confirm(`Soft delete project "${proj.name}"? Existing entries will be kept, but this project will be hidden from new logs.`);
        if (!ok) return;
        proj.active = false;
      } else {
        proj.active = true;
      }
      initProjects();
      initFilters();
      renderAll();
    }

    function initFilters() {
      const today = new Date().toISOString().slice(0, 10);
      document.getElementById("filter-start").value = today;
      document.getElementById("filter-end").value = today;
    }

    function initDates() {
      const today = new Date().toISOString().slice(0, 10);
      document.getElementById("date").value = today;
      document.getElementById("range-start").value = today;
      document.getElementById("range-end").value = today;
    }

    function bindEvents() {
      document.getElementById("log-form").addEventListener("submit", onLogSubmit);
      document.getElementById("clear-form").addEventListener("click", clearForm);
      document.getElementById("add-employee").addEventListener("click", onAddEmployee);
      document.getElementById("add-project").addEventListener("click", onAddProject);

      ["filter-employee", "filter-project", "filter-start", "filter-end"].forEach(id => {
        document.getElementById(id).addEventListener("change", renderAll);
      });

      ["range-start", "range-end"].forEach(id => {
        document.getElementById(id).addEventListener("change", () => {
          document.getElementById("active-range-label").textContent = "Custom range";
        });
      });

      document.getElementById("download-csv").addEventListener("click", downloadCSV);
      document.getElementById("download-csv-bottom").addEventListener("click", downloadCSV);

      document.addEventListener("click", (event) => {
        if (!event.target.closest('.select-shell')) {
          closeAllCustomSelects();
        }
      });
    }

    function upgradeSelects() {
      ["employee", "project", "filter-employee", "filter-project"].forEach(id => createCustomSelect(document.getElementById(id)));
    }

    function createCustomSelect(select) {
      if (!select || select.dataset.customized === "true") return;

      const shell = document.createElement("div");
      shell.className = "select-shell";
      select.parentNode.insertBefore(shell, select);
      shell.appendChild(select);
      select.classList.add("native-select-hidden");
      select.dataset.customized = "true";

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "select-trigger";
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");

      const label = document.createElement("span");
      label.className = "select-label";
      trigger.appendChild(label);

      const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      icon.setAttribute("viewBox", "0 0 18 18");
      icon.setAttribute("fill", "none");
      icon.classList.add("select-icon");
      icon.innerHTML = '<path d="M4.5 7l4.5 4.5L13.5 7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>';
      trigger.appendChild(icon);

      const menu = document.createElement("div");
      menu.className = "select-menu";
      const optionsWrap = document.createElement("div");
      optionsWrap.className = "select-options";
      optionsWrap.setAttribute("role", "listbox");
      menu.appendChild(optionsWrap);

      shell.appendChild(trigger);
      shell.appendChild(menu);

      trigger.addEventListener("click", () => toggleCustomSelect(shell));
      trigger.addEventListener("keydown", (e) => handleTriggerKeydown(e, shell));

      renderCustomSelect(select);
    }

    function renderCustomSelect(select) {
      if (!select) return;
      const shell = select.parentElement;
      if (!shell || !shell.classList.contains("select-shell")) return;

      const trigger = shell.querySelector(".select-trigger");
      const label = shell.querySelector(".select-label");
      const optionsWrap = shell.querySelector(".select-options");
      const selectedOption = select.options[select.selectedIndex] || select.options[0];
      label.textContent = selectedOption ? selectedOption.textContent : "Select";
      optionsWrap.innerHTML = "";

      Array.from(select.options).forEach((option, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "select-option";
        btn.setAttribute("role", "option");
        btn.dataset.value = option.value;
        btn.dataset.index = String(index);
        btn.textContent = option.textContent;
        if (index === select.selectedIndex) btn.classList.add("is-selected");
        btn.addEventListener("click", () => {
          select.selectedIndex = index;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          renderCustomSelect(select);
          closeCustomSelect(shell);
          trigger.focus();
        });
        btn.addEventListener("mouseenter", () => setActiveOption(shell, index));
        optionsWrap.appendChild(btn);
      });

      setActiveOption(shell, Math.max(select.selectedIndex, 0));
      trigger.setAttribute("aria-expanded", shell.classList.contains("is-open") ? "true" : "false");
    }

    function refreshCustomSelect(id) {
      const select = document.getElementById(id);
      if (select && select.dataset.customized === "true") {
        renderCustomSelect(select);
      }
    }

    function toggleCustomSelect(shell) {
      const isOpen = shell.classList.contains("is-open");
      closeAllCustomSelects();
      if (!isOpen) openCustomSelect(shell);
    }

    function openCustomSelect(shell) {
      shell.classList.add("is-open");
      const trigger = shell.querySelector('.select-trigger');
      const select = shell.querySelector('select');
      renderCustomSelect(select);
      trigger.setAttribute('aria-expanded', 'true');
      const active = shell.querySelector('.select-option.is-active') || shell.querySelector('.select-option.is-selected');
      if (active) active.scrollIntoView({ block: 'nearest' });
    }

    function closeCustomSelect(shell) {
      if (!shell) return;
      shell.classList.remove("is-open");
      const trigger = shell.querySelector('.select-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }

    function closeAllCustomSelects() {
      document.querySelectorAll('.select-shell.is-open').forEach(closeCustomSelect);
    }

    function setActiveOption(shell, index) {
      const options = Array.from(shell.querySelectorAll('.select-option'));
      options.forEach(opt => opt.classList.remove('is-active'));
      const next = options[index];
      if (next) next.classList.add('is-active');
    }

    function handleTriggerKeydown(e, shell) {
      const select = shell.querySelector('select');
      const options = Array.from(shell.querySelectorAll('.select-option'));
      let currentIndex = options.findIndex(opt => opt.classList.contains('is-active'));
      if (currentIndex < 0) currentIndex = Math.max(select.selectedIndex, 0);

      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowDown') {
        if (!shell.classList.contains('is-open')) {
          openCustomSelect(shell);
          return;
        }
        currentIndex = Math.min(currentIndex + 1, options.length - 1);
        setActiveOption(shell, currentIndex);
        options[currentIndex]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        if (!shell.classList.contains('is-open')) {
          openCustomSelect(shell);
          return;
        }
        currentIndex = Math.max(currentIndex - 1, 0);
        setActiveOption(shell, currentIndex);
        options[currentIndex]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (!shell.classList.contains('is-open')) {
          openCustomSelect(shell);
        } else if (options[currentIndex]) {
          options[currentIndex].click();
        }
      } else if (e.key === 'Escape') {
        closeCustomSelect(shell);
      }
    }

    function onLogSubmit(e) {
      e.preventDefault();
      const employeeId = document.getElementById("employee").value;
      const projectId = document.getElementById("project").value;
      const date = document.getElementById("date").value;
      const start = document.getElementById("start").value;
      const end = document.getElementById("end").value;
      const notes = document.getElementById("notes").value.trim();
      const errorBox = document.getElementById("log-error");

      errorBox.style.display = "none";
      errorBox.textContent = "";

      if (!employeeId || !projectId || !date || !start || !end) {
        showError("Please fill in Employee, Project, Date, Start and End.");
        return;
      }

      const durationHours = computeDurationHours(date, start, end);
      if (durationHours <= 0) {
        showError("End time must be after start time.");
        return;
      }

      const overlapping = state.entries.some(entry =>
        entry.employeeId === employeeId && entry.date === date && timesOverlap(entry.start, entry.end, start, end)
      );
      if (overlapping) {
        if (!confirm("This overlaps an existing entry for this employee. Log anyway?")) return;
      }

      state.entries.push({ employeeId, projectId, date, start, end, durationHours, notes });
      clearForm();
      renderAll();

      function showError(msg) {
        errorBox.textContent = msg;
        errorBox.style.display = "block";
      }
    }

    function clearForm() {
      const today = new Date().toISOString().slice(0, 10);
      document.getElementById("date").value = today;
      document.getElementById("start").value = "";
      document.getElementById("end").value = "";
      document.getElementById("notes").value = "";
      document.getElementById("log-error").style.display = "none";
    }

    function computeDurationHours(date, start, end) {
      const startDate = new Date(date + "T" + start);
      const endDate = new Date(date + "T" + end);
      return (endDate - startDate) / (1000 * 60 * 60);
    }

    function timesOverlap(s1, e1, s2, e2) {
      return s1 < e2 && s2 < e1;
    }

    function onAddEmployee() {
      const name = prompt("New employee name:");
      if (!name) return;
      state.employees.push(createEmployee(name));
      initEmployees();
      renderAll();
    }

    function onAddProject() {
      const name = prompt("New project name:");
      if (!name) return;
      state.projects.push(createProject(name));
      initProjects();
      renderAll();
    }

    function renderAll() {
      renderEntries();
      renderSummary();
    }

    function filteredEntries() {
      const empId = document.getElementById("filter-employee").value;
      const projId = document.getElementById("filter-project").value;
      const start = document.getElementById("filter-start").value;
      const end = document.getElementById("filter-end").value;
      return state.entries.filter(entry => {
        if (empId && entry.employeeId !== empId) return false;
        if (projId && entry.projectId !== projId) return false;
        if (start && entry.date < start) return false;
        if (end && entry.date > end) return false;
        return true;
      });
    }

    function renderEntries() {
      const tbody = document.querySelector("#entries-table tbody");
      tbody.innerHTML = "";
      filteredEntries().forEach(entry => {
        const row = document.createElement("tr");
        const emp = getEmployeeById(entry.employeeId);
        const proj = getProjectById(entry.projectId);
        const empName = emp ? emp.name + (emp.active ? "" : " (inactive)") : "(unknown)";
        const projName = proj ? proj.name + (proj.active ? "" : " (inactive)") : "(unknown)";
        row.innerHTML = `
          <td>${empName}</td>
          <td>${projName}</td>
          <td>${entry.date}</td>
          <td>${entry.start}</td>
          <td>${entry.end}</td>
          <td>${entry.durationHours.toFixed(2)}</td>
          <td>${entry.notes || ""}</td>
        `;
        tbody.appendChild(row);
      });
    }

    function renderSummary() {
      const entries = filteredEntries();
      const byEmployee = {};
      const byProject = {};
      const matrix = {};

      entries.forEach(entry => {
        byEmployee[entry.employeeId] = (byEmployee[entry.employeeId] || 0) + entry.durationHours;
        byProject[entry.projectId] = (byProject[entry.projectId] || 0) + entry.durationHours;
        if (!matrix[entry.employeeId]) matrix[entry.employeeId] = {};
        matrix[entry.employeeId][entry.projectId] = (matrix[entry.employeeId][entry.projectId] || 0) + entry.durationHours;
      });

      const empBody = document.querySelector("#summary-employee tbody");
      const projBody = document.querySelector("#summary-project tbody");
      empBody.innerHTML = "";
      projBody.innerHTML = "";

      Object.entries(byEmployee).forEach(([id, hours]) => {
        const emp = getEmployeeById(id);
        const row = document.createElement("tr");
        row.innerHTML = `<td>${emp ? emp.name : "(unknown)"}</td><td>${hours.toFixed(2)}</td>`;
        empBody.appendChild(row);
      });

      Object.entries(byProject).forEach(([id, hours]) => {
        const proj = getProjectById(id);
        const row = document.createElement("tr");
        row.innerHTML = `<td>${proj ? proj.name : "(unknown)"}</td><td>${hours.toFixed(2)}</td>`;
        projBody.appendChild(row);
      });

      const topProjectIds = Object.entries(byProject)
        .sort(([, a], [, b]) => b - a)
        .map(([projectId]) => projectId)
        .slice(0, 5);

      renderEmployeeProjectMatrix(matrix, topProjectIds);
    }

    function renderEmployeeProjectMatrix(matrix, topProjectIds) {
      const thead = document.querySelector("#summary-employee-project thead");
      const tbody = document.querySelector("#summary-employee-project tbody");
      thead.innerHTML = "";
      tbody.innerHTML = "";

      if (!topProjectIds.length || Object.keys(matrix).length === 0) {
        const emptyHeadRow = document.createElement("tr");
        emptyHeadRow.innerHTML = `<th>Employee</th><th>Projects</th>`;
        thead.appendChild(emptyHeadRow);
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `<td colspan="2" class="muted">No data in the current filter range.</td>`;
        tbody.appendChild(emptyRow);
        return;
      }

      const headRow = document.createElement("tr");
      headRow.innerHTML = `<th>Employee</th>`;
      topProjectIds.forEach(projectId => {
        const proj = getProjectById(projectId);
        const th = document.createElement("th");
        th.textContent = proj ? proj.name : "(unknown)";
        headRow.appendChild(th);
      });
      const otherTh = document.createElement("th");
      otherTh.textContent = "Other";
      headRow.appendChild(otherTh);
      const totalTh = document.createElement("th");
      totalTh.textContent = "Total";
      headRow.appendChild(totalTh);
      thead.appendChild(headRow);

      Object.entries(matrix).forEach(([employeeId, projectHoursMap]) => {
        const emp = getEmployeeById(employeeId);
        const row = document.createElement("tr");
        let rowTotal = 0;

        const empCell = document.createElement("td");
        empCell.textContent = emp ? emp.name : "(unknown)";
        row.appendChild(empCell);

        topProjectIds.forEach(projectId => {
          const hours = projectHoursMap[projectId] || 0;
          const cell = document.createElement("td");
          cell.textContent = hours > 0 ? hours.toFixed(2) : "";
          row.appendChild(cell);
          rowTotal += hours;
        });

        let otherHours = 0;
        Object.entries(projectHoursMap).forEach(([projectId, hours]) => {
          if (!topProjectIds.includes(projectId)) otherHours += hours;
        });

        const otherCell = document.createElement("td");
        otherCell.textContent = otherHours > 0 ? otherHours.toFixed(2) : "";
        row.appendChild(otherCell);
        rowTotal += otherHours;

        const totalCell = document.createElement("td");
        totalCell.textContent = rowTotal.toFixed(2);
        row.appendChild(totalCell);
        tbody.appendChild(row);
      });
    }

    function downloadCSV() {
      const rows = [
        ["Employee", "Project", "Date", "Start", "End", "DurationHours", "Notes"],
        ...state.entries.map(e => {
          const emp = getEmployeeById(e.employeeId);
          const proj = getProjectById(e.projectId);
          return [
            emp ? emp.name : "(unknown)",
            proj ? proj.name : "(unknown)",
            e.date,
            e.start,
            e.end,
            e.durationHours.toFixed(2),
            e.notes.replace(/"/g, '""')
          ];
        })
      ];
      const csvContent = rows.map(r => r.map(field => `"${field}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "uplus-timesheet.csv";
      a.click();
      URL.revokeObjectURL(url);
    }

    function switchTab(name) {
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.hidden = panel.id !== `tab-${name}`;
      });
    
      document.querySelectorAll('.tab').forEach(btn => {
        const active = btn.dataset.tab === name;
        btn.classList.toggle('active', active);
      });
    }
    
    document.querySelectorAll('.tab').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    switchTab('log-manage');

    init();