document.addEventListener('DOMContentLoaded', function () {
    const viewContainer = document.getElementById('view-container');
    let currentView = '';
    let loggedIn = false; // Simulación de estado de inicio de sesión
    let contracts = [ // Datos de contratos de ejemplo
        { id: 1, name: 'Contrato A' },
        { id: 2, name: 'Contrato B' },
        { id: 3, name: 'Contrato C' }
    ];
    let editingContractId = null; // Para rastrear el contrato que se está editando
    let menuVisible = false;

    async function loadView(viewName) {
        try {
            const response = await fetch(`./views/${viewName}.html`);
            if (!response.ok) {
                throw new Error(`Error al cargar la vista ${viewName}`);
            }
            const html = await response.text();
            viewContainer.innerHTML = html;
            currentView = viewName;
            attachEventListeners(); // Adjuntar eventos específicos de la vista cargada
        } catch (error) {
            console.error(error);
            viewContainer.innerHTML = '<div>Error al cargar la vista</div>';
        }
    }

    function attachEventListeners() {
        // Remove any existing menu if present
        const existingMenu = document.getElementById('navigationMenu');
        if (existingMenu) {
            existingMenu.remove();
            menuVisible = false;
        }

        const menuButton = document.getElementById('menuButton');
        if (menuButton) {
            menuButton.addEventListener('click', toggleMenu);
        }

        switch (currentView) {
            case 'login':
                const loginForm = document.getElementById('loginForm');
                loginForm.addEventListener('submit', handleLogin);
                break;
            case 'dashboard':
                // Menu button listener is already attached
                console.log('Script ejecutado desde dashboard.html');
                const contenedorFlujos = document.getElementById('flujos-grid'); // Asegúrate de tener un elemento con este ID en tu HTML
                cargarFlujosDesdeCSV(contenedorFlujos, 'data/flujos.csv'); // Reemplaza con la ruta correcta
                break;
            case 'projected-balances':
                // Menu button listener is already attached
                break;
            case 'contract-list':
                // Menu button listener is already attached
                const addContractButton = document.getElementById('addContractButton');
                addContractButton.addEventListener('click', () => showView('contract-editor', null));
                const contractListElement = document.getElementById('contractList');
                renderContractList(); // Renderizar la lista al cargar la vista
                contractListElement.addEventListener('click', handleContractClick);
                break;
            case 'contract-editor':
                // No menu button in contract editor
                const cancelButton = document.getElementById('cancelButton');
                cancelButton.addEventListener('click', () => showView('contract-list'));
                const contractEditorForm = document.getElementById('contractEditorForm');
                contractEditorForm.addEventListener('submit', handleContractSubmit);
                const editorTitle = document.getElementById('editor-title');
                const submitButton = document.getElementById('submitButton');
                const isNew = editingContractId === null;
                editorTitle.textContent = isNew ? 'Nuevo Contrato' : 'Editar Contrato';
                submitButton.textContent = isNew ? 'Agregar' : 'Actualizar';
                populateContractForm(editingContractId);
                break;
        }
    }

    function handleLogin(event) {
        event.preventDefault();
        const loginForm = event.target;
        const username = loginForm.username.value;
        const password = loginForm.password.value;
        if (username === 'admin' && password === 'admin') {
            loggedIn = true;
            showView('dashboard');
        } else {
            alert('Credenciales incorrectas');
        }
    }

    function renderContractList() {
        const contractListElement = document.getElementById('contractList');
        if (contractListElement) {
            contractListElement.innerHTML = contracts.map(contract => `<li data-id="${contract.id}">${contract.name}</li>`).join('');
        }
    }

    function handleContractClick(event) {
        const listItem = event.target.closest('li');
        if (listItem) {
            editingContractId = parseInt(listItem.dataset.id);
            showView('contract-editor');
        }
    }

    function handleContractSubmit(event) {
        event.preventDefault();
        const contractNameInput = document.getElementById('contractName');
        const contractName = contractNameInput.value;
        const isNew = editingContractId === null;

        if (isNew) {
            const newId = contracts.length > 0 ? Math.max(...contracts.map(c => c.id)) + 1 : 1;
            contracts.push({ id: newId, name: contractName });
        } else {
            const index = contracts.findIndex(c => c.id === editingContractId);
            if (index !== -1) {
                contracts[index].name = contractName;
            }
        }
        editingContractId = null; // Resetear el ID de edición
        showView('contract-list');
    }

    function populateContractForm(contractId) {
        const contractNameInput = document.getElementById('contractName');
        if (contractId) {
            const contract = contracts.find(c => c.id === contractId);
            if (contract) {
                contractNameInput.value = contract.name;
            }
        } else {
            contractNameInput.value = ''; // Limpiar el formulario para nuevo contrato
        }
    }

    function showView(viewName, data = null) {
        if (viewName === 'contract-editor') {
            editingContractId = data; // Guardar el ID para editar
        } else {
            editingContractId = null; // Resetear al cambiar a otras vistas
        }

        if (loggedIn || viewName === 'login') {
            loadView(viewName);
        } else {
            loadView('login');
        }
    }

    function renderMenu() {
        const menu = document.createElement('div');
        menu.id = 'navigationMenu';
        menu.style.position = 'absolute';
        menu.style.top = '55px'; // Adjust as needed based on your header height
        menu.style.left = '0';
        menu.style.backgroundColor = '#444';
        menu.style.color = 'white';
        menu.style.padding = '10px';
        menu.style.zIndex = '10'; // Ensure it's above other content

        let options = [];
        switch (currentView) {
            case 'dashboard':
                options = [
                    { label: 'Saldos Proyectados', view: 'projected-balances' },
                    { label: 'Lista de Contratos', view: 'contract-list' }
                ];
                break;
            case 'contract-list':
                options = [
                    { label: 'Dashboard', view: 'dashboard' },
                    { label: 'Saldos Proyectados', view: 'projected-balances' }
                ];
                break;
            case 'projected-balances':
                options = [
                    { label: 'Dashboard', view: 'dashboard' },
                    { label: 'Lista de Contratos', view: 'contract-list' }
                ];
                break;
        }

        options.forEach(option => {
            const menuItem = document.createElement('div');
            menuItem.textContent = option.label;
            menuItem.style.padding = '8px';
            menuItem.style.cursor = 'pointer';
            menuItem.addEventListener('click', () => {
                showView(option.view);
                toggleMenu(); // Hide menu after navigation
            });
            menu.appendChild(menuItem);
        });

        document.body.appendChild(menu);
        menuVisible = true;
    }

    function toggleMenu() {
        const menu = document.getElementById('navigationMenu');
        if (menu) {
            menu.remove();
            menuVisible = false;
        } else if (currentView !== 'contract-editor') {
            renderMenu();
        }
    }

    // Inicializar la aplicación mostrando la página de login
    showView('login');
});