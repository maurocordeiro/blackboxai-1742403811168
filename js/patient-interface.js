// Patient Interface Handler
class PatientInterface {
    constructor() {
        this.currentPatient = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // New Patient Form
        const newPatientBtn = document.querySelector('#newPatientBtn');
        if (newPatientBtn) {
            newPatientBtn.addEventListener('click', () => this.showNewPatientForm());
        }

        // Patient List
        const patientList = document.querySelector('#patientList');
        if (patientList) {
            this.renderPatientList();
        }

        // CSV Import/Export
        const importCsvBtn = document.querySelector('#importCsvBtn');
        const exportCsvBtn = document.querySelector('#exportCsvBtn');

        if (importCsvBtn) {
            importCsvBtn.addEventListener('click', () => this.handleCsvImport());
        }
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => this.handleCsvExport());
        }
    }

    showNewPatientForm() {
        const formHtml = `
            <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="patientFormModal">
                <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <div class="mt-3">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">Novo Paciente</h3>
                        <form id="newPatientForm" class="mt-4 space-y-4" novalidate>
                            <div class="validation-messages"></div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="patientName">
                    Nome Completo <span class="text-red-500">*</span>
                </label>
                <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                    id="patientName" type="text" required
                    pattern="[A-Za-zÀ-ÖØ-öø-ÿ\\s]{3,}"
                    title="Nome deve conter pelo menos 3 caracteres e apenas letras">
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="patientBirthdate">
                    Data de Nascimento <span class="text-red-500">*</span>
                </label>
                <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                    id="patientBirthdate" type="date" required
                    max="${new Date().toISOString().split('T')[0]}"
                    title="Data de nascimento não pode ser no futuro">
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="patientEmail">
                    Email <span class="text-red-500">*</span>
                </label>
                <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                    id="patientEmail" type="email" required
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
                    title="Insira um endereço de email válido">
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="patientPhone">
                    Telefone <span class="text-red-500">*</span>
                </label>
                <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                    id="patientPhone" type="tel" required
                    pattern="\\([0-9]{2}\\)\\s[0-9]{4,5}-[0-9]{4}"
                    title="Formato: (XX) XXXXX-XXXX"
                    placeholder="(XX) XXXXX-XXXX">
            </div>
            <div class="mb-6">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="patientAddress">
                    Endereço <span class="text-red-500">*</span>
                </label>
                <textarea class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                    id="patientAddress" required
                    minlength="10"
                    title="Endereço deve conter pelo menos 10 caracteres"></textarea>
            </div>
                            <div class="flex items-center justify-between">
                                <button class="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
                                    type="submit">
                                    Salvar
                                </button>
                                <button class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
                                    type="button" onclick="document.getElementById('patientFormModal').remove()">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', formHtml);

        // Add form submit handler
        const form = document.getElementById('newPatientForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Remove any existing error messages
            form.querySelectorAll('.error-message').forEach(el => el.remove());
            form.querySelectorAll('.border-red-500').forEach(el => el.classList.remove('border-red-500'));
            
            if (this.validateForm(form)) {
                this.handleNewPatientSubmit(form);
            }
        });

        // Add input event listeners for real-time validation
        form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => {
                const errorMessage = input.parentElement.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
                input.classList.remove('border-red-500');
            });
        });
    }

    handleNewPatientSubmit(form) {
        // Clear previous validation messages
        this.clearValidationMessages();

        // Get all form fields
        const fields = {
            name: {
                element: form.querySelector('#patientName'),
                regex: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,}$/,
                message: 'Nome deve conter pelo menos 3 caracteres e apenas letras',
                label: 'Nome Completo'
            },
            birthdate: {
                element: form.querySelector('#patientBirthdate'),
                message: 'Data de nascimento é obrigatória',
                label: 'Data de Nascimento'
            },
            email: {
                element: form.querySelector('#patientEmail'),
                regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Por favor, insira um email válido',
                label: 'Email'
            },
            phone: {
                element: form.querySelector('#patientPhone'),
                regex: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
                message: 'Formato: (XX) XXXXX-XXXX',
                label: 'Telefone'
            },
            address: {
                element: form.querySelector('#patientAddress'),
                minLength: 10,
                message: 'Endereço deve conter pelo menos 10 caracteres',
                label: 'Endereço'
            }
        };

        let isValid = true;
        let firstInvalidField = null;

        // Validate each field
        Object.entries(fields).forEach(([fieldName, field]) => {
            const value = field.element.value.trim();

            // Remove previous error styling
            field.element.classList.remove('border-red-500');
            const existingError = field.element.parentElement.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }

            // Check if empty
            if (!value) {
                this.showFieldError(field.element, `${field.label} é obrigatório`);
                isValid = false;
                firstInvalidField = firstInvalidField || field.element;
                return;
            }

            // Check regex if exists
            if (field.regex && !field.regex.test(value)) {
                this.showFieldError(field.element, field.message);
                isValid = false;
                firstInvalidField = firstInvalidField || field.element;
                return;
            }

            // Check minLength if exists
            if (field.minLength && value.length < field.minLength) {
                this.showFieldError(field.element, field.message);
                isValid = false;
                firstInvalidField = firstInvalidField || field.element;
                return;
            }

            // Special validation for birthdate
            if (fieldName === 'birthdate') {
                const birthdate = new Date(value);
                const today = new Date();
                if (birthdate > today) {
                    this.showFieldError(field.element, 'Data de nascimento não pode ser no futuro');
                    isValid = false;
                    firstInvalidField = firstInvalidField || field.element;
                    return;
                }
            }
        });

        if (!isValid) {
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
            this.showNotification('Por favor, corrija os erros no formulário.', 'error');
            return;
        }

        // Validate each field
        validations.forEach(validation => {
            const field = form.querySelector(validation.field);
            const value = field.value.trim();

            if (!value) {
                this.showFieldError(field, 'Este campo é obrigatório');
                isValid = false;
                return;
            }

            if (validation.regex && !validation.regex.test(value)) {
                this.showFieldError(field, validation.message);
                isValid = false;
                return;
            }

            if (validation.minLength && value.length < validation.minLength) {
                this.showFieldError(field, validation.message);
                isValid = false;
                return;
            }
        });

        // Validate birthdate
        const birthdateField = form.querySelector('#patientBirthdate');
        if (!birthdateField.value) {
            this.showFieldError(birthdateField, 'Data de nascimento é obrigatória');
            isValid = false;
        } else {
            const birthdate = new Date(birthdateField.value);
            const today = new Date();
            if (birthdate > today) {
                this.showFieldError(birthdateField, 'Data de nascimento não pode ser no futuro');
                isValid = false;
            }
        }

        if (!isValid) {
            this.showNotification('Por favor, corrija os erros no formulário.', 'error');
            return;
        }

        const patientData = {
            name: name,
            birthdate: form.querySelector('#patientBirthdate').value,
            email: email,
            phone: phone,
            address: address
        };

        try {
            const patient = patientManager.addPatient(patientData);
            
            // Show success message with slide animation
            this.showNotification('Paciente adicionado com sucesso!', 'success');
            
            // Add fade-out animation to modal
            const modal = document.getElementById('patientFormModal');
            modal.classList.add('opacity-0', 'transition-opacity', 'duration-300');
            
            // Wait for animation to complete before removing modal and updating list
            setTimeout(() => {
                modal.remove();
                this.renderPatientList();
                this.updateDashboardStats();
            }, 300);
            
        } catch (error) {
            this.showNotification('Erro ao adicionar paciente. Por favor, tente novamente.', 'error');
            console.error('Error adding patient:', error);
        }
    }

    updateDashboardStats() {
        const totalPatientsElement = document.querySelector('#totalPatients');
        if (totalPatientsElement) {
            totalPatientsElement.textContent = patientManager.getAllPatients().length;
        }
    }

    renderPatientList() {
        const patients = patientManager.getAllPatients();
        const patientList = document.querySelector('#patientList');
        
        if (!patientList) return;

        patientList.innerHTML = patients.map(patient => `
            <div class="bg-white shadow rounded-lg p-4 mb-4">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">${patient.name}</h3>
                        <p class="text-sm text-gray-500">${patient.email} | ${patient.phone}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="patientInterface.viewPatient('${patient.id}')" 
                            class="bg-primary text-white px-3 py-1 rounded hover:bg-blue-700">
                            Ver Detalhes
                        </button>
                        <button onclick="patientInterface.deletePatient('${patient.id}')" 
                            class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700">
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    viewPatient(patientId) {
        const patient = patientManager.getPatient(patientId);
        if (!patient) return;

        this.currentPatient = patient;
        
        const detailHtml = `
            <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="patientDetailModal">
                <div class="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold text-gray-900">${patient.name}</h2>
                        <button onclick="document.getElementById('patientDetailModal').remove()" 
                            class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-gray-50 p-4 rounded">
                            <h3 class="text-lg font-medium mb-2">Informações Pessoais</h3>
                            <p><strong>Email:</strong> ${patient.email}</p>
                            <p><strong>Telefone:</strong> ${patient.phone}</p>
                            <p><strong>Endereço:</strong> ${patient.address}</p>
                            <p><strong>Data de Nascimento:</strong> ${new Date(patient.birthdate).toLocaleDateString()}</p>
                        </div>
                        
                        <div class="bg-gray-50 p-4 rounded">
                            <h3 class="text-lg font-medium mb-2">Tratamentos</h3>
                            <button onclick="patientInterface.showNewTreatmentForm('${patient.id}')" 
                                class="bg-primary text-white px-3 py-1 rounded hover:bg-blue-700 mb-2">
                                Novo Tratamento
                            </button>
                            <div id="treatmentsList">
                                ${this.renderTreatmentsList(patient.treatments)}
                            </div>
                        </div>
                        
                        <div class="bg-gray-50 p-4 rounded">
                            <h3 class="text-lg font-medium mb-2">Documentos</h3>
                            <input type="file" id="documentUpload" class="hidden" 
                                onchange="patientInterface.handleDocumentUpload('${patient.id}', this.files[0])">
                            <button onclick="document.getElementById('documentUpload').click()" 
                                class="bg-primary text-white px-3 py-1 rounded hover:bg-blue-700 mb-2">
                                Upload Documento
                            </button>
                            <div id="documentsList">
                                ${this.renderDocumentsList(patient.documents)}
                            </div>
                        </div>
                        
                        <div class="bg-gray-50 p-4 rounded">
                            <h3 class="text-lg font-medium mb-2">Fotos Antes/Depois</h3>
                            <input type="file" id="photoUpload" class="hidden" accept="image/*"
                                onchange="patientInterface.handlePhotoUpload('${patient.id}', this.files[0])">
                            <button onclick="document.getElementById('photoUpload').click()" 
                                class="bg-primary text-white px-3 py-1 rounded hover:bg-blue-700 mb-2">
                                Upload Foto
                            </button>
                            <div id="photosList">
                                ${this.renderPhotosList(patient.photos)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', detailHtml);
    }

    renderTreatmentsList(treatments) {
        if (!treatments.length) return '<p class="text-gray-500">Nenhum tratamento registrado</p>';

        return treatments.map(treatment => `
            <div class="border-b py-2">
                <h4 class="font-medium">${treatment.type}</h4>
                <p class="text-sm text-gray-600">${treatment.description}</p>
                <p class="text-xs text-gray-500">
                    ${new Date(treatment.startDate).toLocaleDateString()} - 
                    ${treatment.endDate ? new Date(treatment.endDate).toLocaleDateString() : 'Em andamento'}
                </p>
            </div>
        `).join('');
    }

    renderDocumentsList(documents) {
        if (!documents.length) return '<p class="text-gray-500">Nenhum documento anexado</p>';

        return documents.map(doc => `
            <div class="border-b py-2">
                <p class="font-medium">${doc.name}</p>
                <p class="text-xs text-gray-500">${new Date(doc.createdAt).toLocaleDateString()}</p>
            </div>
        `).join('');
    }

    renderPhotosList(photos) {
        if (!photos.length) return '<p class="text-gray-500">Nenhuma foto registrada</p>';

        return photos.map(photo => `
            <div class="border-b py-2">
                <p class="font-medium">${photo.type === 'before' ? 'Antes' : 'Depois'}</p>
                <p class="text-sm">${photo.description}</p>
                <p class="text-xs text-gray-500">${new Date(photo.date).toLocaleDateString()}</p>
            </div>
        `).join('');
    }

    showNewTreatmentForm(patientId) {
        const formHtml = `
            <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="treatmentFormModal">
                <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <div class="mt-3">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">Novo Tratamento</h3>
                        <form id="newTreatmentForm" class="mt-4">
                            <div class="mb-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="treatmentType">
                                    Tipo de Tratamento
                                </label>
                                <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                    id="treatmentType" type="text" required>
                            </div>
                            <div class="mb-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="treatmentDescription">
                                    Descrição
                                </label>
                                <textarea class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                    id="treatmentDescription" required></textarea>
                            </div>
                            <div class="mb-4">
                                <label class="block text-gray-700 text-sm font-bold mb-2" for="treatmentStartDate">
                                    Data de Início
                                </label>
                                <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                    id="treatmentStartDate" type="date" required>
                            </div>
                            <div class="flex items-center justify-between">
                                <button class="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
                                    type="submit">
                                    Salvar
                                </button>
                                <button class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
                                    type="button" onclick="document.getElementById('treatmentFormModal').remove()">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', formHtml);

        // Add form submit handler
        document.getElementById('newTreatmentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleNewTreatmentSubmit(patientId, e.target);
        });
    }

    handleNewTreatmentSubmit(patientId, form) {
        const patient = patientManager.getPatient(patientId);
        if (!patient) return;

        const treatmentData = {
            type: form.querySelector('#treatmentType').value,
            description: form.querySelector('#treatmentDescription').value,
            startDate: form.querySelector('#treatmentStartDate').value,
            status: 'active'
        };

        patient.addTreatment(treatmentData);
        patientManager.saveToLocalStorage();

        // Close modal and refresh view
        document.getElementById('treatmentFormModal').remove();
        this.viewPatient(patientId);
        
        // Show success message
        this.showNotification('Tratamento adicionado com sucesso!', 'success');
    }

    handleDocumentUpload(patientId, file) {
        if (!file) return;

        const patient = patientManager.getPatient(patientId);
        if (!patient) return;

        // In a real app, we'd upload the file to a server
        // For now, we'll just store the file name
        patient.addDocument({
            type: file.type,
            name: file.name,
            file: URL.createObjectURL(file)
        });

        patientManager.saveToLocalStorage();
        this.viewPatient(patientId);
        this.showNotification('Documento anexado com sucesso!', 'success');
    }

    handlePhotoUpload(patientId, file) {
        if (!file) return;

        const patient = patientManager.getPatient(patientId);
        if (!patient) return;

        // Show photo type selection modal
        const modalHtml = `
            <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="photoTypeModal">
                <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <h3 class="text-lg font-medium mb-4">Tipo de Foto</h3>
                    <div class="space-y-4">
                        <button onclick="patientInterface.savePhoto('${patientId}', '${URL.createObjectURL(file)}', 'before')"
                            class="w-full bg-primary text-white px-4 py-2 rounded hover:bg-blue-700">
                            Antes do Tratamento
                        </button>
                        <button onclick="patientInterface.savePhoto('${patientId}', '${URL.createObjectURL(file)}', 'after')"
                            class="w-full bg-primary text-white px-4 py-2 rounded hover:bg-blue-700">
                            Depois do Tratamento
                        </button>
                        <button onclick="document.getElementById('photoTypeModal').remove()"
                            class="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    savePhoto(patientId, fileUrl, type) {
        const patient = patientManager.getPatient(patientId);
        if (!patient) return;

        patient.addPhoto({
            type: type,
            description: `Foto ${type === 'before' ? 'antes' : 'depois'} do tratamento`,
            file: fileUrl
        });

        patientManager.saveToLocalStorage();
        document.getElementById('photoTypeModal').remove();
        this.viewPatient(patientId);
        this.showNotification('Foto adicionada com sucesso!', 'success');
    }

    deletePatient(patientId) {
        if (confirm('Tem certeza que deseja excluir este paciente?')) {
            patientManager.deletePatient(patientId);
            this.renderPatientList();
            this.showNotification('Paciente excluído com sucesso!', 'success');
        }
    }

    handleCsvImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const csvData = this.parseCSV(event.target.result);
                    patientManager.importFromCSV(csvData);
                    this.renderPatientList();
                    this.showNotification('Dados importados com sucesso!', 'success');
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    handleCsvExport() {
        const data = patientManager.exportToCSV();
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pacientes-dermacare.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    parseCSV(text) {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const obj = {};
            const currentline = lines[i].split(',');
            
            headers.forEach((header, j) => {
                obj[header] = currentline[j].trim();
            });
            
            result.push(obj);
        }

        return result;
    }

    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const csvRows = [];
        
        csvRows.push(headers.join(','));
        
        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header];
                return `"${val}"`;
            });
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const icon = type === 'success' ? '<i class="fas fa-check-circle mr-2"></i>' :
                    type === 'error' ? '<i class="fas fa-exclamation-circle mr-2"></i>' :
                    '<i class="fas fa-info-circle mr-2"></i>';
        
        notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white flex items-center ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        } transform transition-transform duration-300 ease-in-out`;
        
        notification.innerHTML = `${icon}<span>${message}</span>`;
        
        // Add slide-in animation
        notification.style.transform = 'translateX(100%)';
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Add slide-out animation before removing
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    validateForm(form) {
        const requiredFields = ['patientName', 'patientBirthdate', 'patientEmail', 'patientPhone', 'patientAddress'];
        let isValid = true;
        let firstError = null;

        requiredFields.forEach(fieldId => {
            const field = form.querySelector(`#${fieldId}`);
            const value = field.value.trim();

            // Remove existing error messages
            const existingError = field.parentElement.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            field.classList.remove('border-red-500');

            if (!value) {
                this.showFieldError(field, 'Este campo é obrigatório');
                isValid = false;
                firstError = firstError || field;
            }
        });

        // Check birthdate
        const birthdateField = form.querySelector('#patientBirthdate');
        const birthdate = new Date(birthdateField.value);
        const today = new Date();
        
        if (birthdate > today) {
            this.showFieldError(birthdateField, 'Data de nascimento não pode ser no futuro');
            isValid = false;
            firstError = firstError || birthdateField;
        }

        if (firstError) {
            firstError.focus();
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('border-red-500');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-500 text-sm mt-1 flex items-center';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle mr-2"></i>
            <span>${message}</span>
        `;
        
        // Remove any existing error message
        const existingError = field.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        field.parentElement.appendChild(errorDiv);
        
        // Add shake animation to the field
        field.classList.add('animate-shake');
        setTimeout(() => field.classList.remove('animate-shake'), 500);
        
        // Show validation message at the top of the form
        const validationMessages = document.querySelector('.validation-messages');
        if (validationMessages) {
            const fieldName = field.previousElementSibling?.textContent?.replace('*', '').trim() || 'Campo';
            const messageDiv = document.createElement('div');
            messageDiv.className = 'bg-red-50 text-red-700 p-2 rounded mb-2 flex items-center text-sm';
            messageDiv.innerHTML = `
                <i class="fas fa-exclamation-circle mr-2"></i>
                <span>${fieldName}: ${message}</span>
            `;
            validationMessages.appendChild(messageDiv);
        }
    }

    clearValidationMessages() {
        // Clear all error messages
        const validationMessages = document.querySelector('.validation-messages');
        if (validationMessages) {
            validationMessages.innerHTML = '';
        }
        
        // Remove error styling from all fields
        const form = document.getElementById('newPatientForm');
        if (form) {
            form.querySelectorAll('.error-message').forEach(el => el.remove());
            form.querySelectorAll('.border-red-500').forEach(el => el.classList.remove('border-red-500'));
        }
    }
}

// Create a global instance of PatientInterface
const patientInterface = new PatientInterface();