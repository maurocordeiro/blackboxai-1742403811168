// Patient Management
class Patient {
    constructor(data) {
        this.id = data.id || crypto.randomUUID();
        this.name = data.name;
        this.birthdate = data.birthdate;
        this.email = data.email;
        this.phone = data.phone;
        this.address = data.address;
        this.treatments = data.treatments || [];
        this.documents = data.documents || [];
        this.photos = data.photos || [];
        this.budgets = data.budgets || [];
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    addTreatment(treatment) {
        this.treatments.push({
            id: crypto.randomUUID(),
            type: treatment.type,
            description: treatment.description,
            startDate: treatment.startDate,
            endDate: treatment.endDate,
            status: treatment.status,
            followUpNotes: treatment.followUpNotes || [],
            createdAt: new Date().toISOString()
        });
        this.updatedAt = new Date().toISOString();
    }

    addDocument(document) {
        this.documents.push({
            id: crypto.randomUUID(),
            type: document.type,
            name: document.name,
            file: document.file,
            createdAt: new Date().toISOString()
        });
        this.updatedAt = new Date().toISOString();
    }

    addPhoto(photo) {
        this.photos.push({
            id: crypto.randomUUID(),
            type: photo.type, // 'before' or 'after'
            description: photo.description,
            file: photo.file,
            date: photo.date || new Date().toISOString(),
            createdAt: new Date().toISOString()
        });
        this.updatedAt = new Date().toISOString();
    }

    addBudget(budget) {
        this.budgets.push({
            id: crypto.randomUUID(),
            description: budget.description,
            amount: budget.amount,
            treatments: budget.treatments,
            status: budget.status,
            createdAt: new Date().toISOString()
        });
        this.updatedAt = new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            birthdate: this.birthdate,
            email: this.email,
            phone: this.phone,
            address: this.address,
            treatments: this.treatments,
            documents: this.documents,
            photos: this.photos,
            budgets: this.budgets,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

// PatientManager handles all patient-related operations
class PatientManager {
    constructor() {
        this.patients = new Map();
        this.loadFromLocalStorage();
    }

    loadFromLocalStorage() {
        const savedPatients = localStorage.getItem('dermacare_patients');
        if (savedPatients) {
            const parsedPatients = JSON.parse(savedPatients);
            parsedPatients.forEach(patientData => {
                this.patients.set(patientData.id, new Patient(patientData));
            });
        }
    }

    saveToLocalStorage() {
        const patientsArray = Array.from(this.patients.values()).map(patient => patient.toJSON());
        localStorage.setItem('dermacare_patients', JSON.stringify(patientsArray));
    }

    addPatient(patientData) {
        const patient = new Patient(patientData);
        this.patients.set(patient.id, patient);
        this.saveToLocalStorage();
        return patient;
    }

    getPatient(id) {
        return this.patients.get(id);
    }

    updatePatient(id, updateData) {
        const patient = this.patients.get(id);
        if (!patient) return null;

        Object.assign(patient, updateData);
        patient.updatedAt = new Date().toISOString();
        this.saveToLocalStorage();
        return patient;
    }

    deletePatient(id) {
        const result = this.patients.delete(id);
        if (result) {
            this.saveToLocalStorage();
        }
        return result;
    }

    getAllPatients() {
        return Array.from(this.patients.values());
    }

    importFromCSV(csvData) {
        const patients = csvData.map(row => {
            return new Patient({
                name: row.name,
                birthdate: row.birthdate,
                email: row.email,
                phone: row.phone,
                address: row.address
            });
        });

        patients.forEach(patient => {
            this.patients.set(patient.id, patient);
        });

        this.saveToLocalStorage();
        return patients;
    }

    exportToCSV() {
        const patients = this.getAllPatients();
        return patients.map(patient => ({
            id: patient.id,
            name: patient.name,
            birthdate: patient.birthdate,
            email: patient.email,
            phone: patient.phone,
            address: patient.address,
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt
        }));
    }
}

// Create a global instance of PatientManager
const patientManager = new PatientManager();