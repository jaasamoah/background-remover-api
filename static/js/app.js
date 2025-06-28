// Background Remover App JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const filePreview = document.getElementById('filePreview');
    const previewImage = document.getElementById('previewImage');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const submitBtn = document.getElementById('submitBtn');
    const uploadForm = document.getElementById('uploadForm');
    const submitText = document.getElementById('submitText');
    const loadingText = document.getElementById('loadingText');

    // Maximum file size (16MB)
    const MAX_FILE_SIZE = 16 * 1024 * 1024;
    
    // Allowed file types
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/webp'];

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Click to upload
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Form submission
    uploadForm.addEventListener('submit', function(e) {
        if (!validateFile()) {
            e.preventDefault();
            return;
        }
        
        // Show loading state
        setLoadingState(true);
    });

    function handleFile(file) {
        // Reset previous states
        clearValidationStates();
        
        // Validate file
        if (!validateFile(file)) {
            return;
        }

        // Update file input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        // Show preview
        showFilePreview(file);
        
        // Enable submit button
        submitBtn.disabled = false;
        uploadArea.classList.add('file-success');
    }

    function validateFile(file = null) {
        const targetFile = file || (fileInput.files.length > 0 ? fileInput.files[0] : null);
        
        if (!targetFile) {
            showError('Please select a file');
            return false;
        }

        // Check file type
        if (!ALLOWED_TYPES.includes(targetFile.type)) {
            showError('Invalid file type. Please upload PNG, JPG, JPEG, GIF, BMP, or WebP files.');
            return false;
        }

        // Check file size
        if (targetFile.size > MAX_FILE_SIZE) {
            showError('File too large. Maximum size is 16MB.');
            return false;
        }

        return true;
    }

    function showFilePreview(file) {
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        
        // Create image preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            filePreview.classList.remove('d-none');
        };
        reader.readAsDataURL(file);
    }

    function clearFile() {
        fileInput.value = '';
        filePreview.classList.add('d-none');
        submitBtn.disabled = true;
        clearValidationStates();
        setLoadingState(false);
    }

    function showError(message) {
        uploadArea.classList.add('file-error');
        
        // Create or update error alert
        let errorAlert = document.querySelector('.alert-danger');
        if (!errorAlert) {
            errorAlert = document.createElement('div');
            errorAlert.className = 'alert alert-danger alert-dismissible fade show mt-3';
            errorAlert.innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>
                <span class="error-message">${message}</span>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            uploadForm.appendChild(errorAlert);
        } else {
            errorAlert.querySelector('.error-message').textContent = message;
        }
        
        submitBtn.disabled = true;
    }

    function clearValidationStates() {
        uploadArea.classList.remove('file-error', 'file-success');
        
        // Remove any existing error alerts
        const errorAlerts = document.querySelectorAll('.alert-danger');
        errorAlerts.forEach(alert => alert.remove());
    }

    function setLoadingState(loading) {
        if (loading) {
            submitText.classList.add('d-none');
            loadingText.classList.remove('d-none');
            submitBtn.disabled = true;
            uploadArea.classList.add('loading');
        } else {
            submitText.classList.remove('d-none');
            loadingText.classList.add('d-none');
            submitBtn.disabled = fileInput.files.length === 0;
            uploadArea.classList.remove('loading');
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Make clearFile function global
    window.clearFile = clearFile;

    // Handle page visibility change to reset loading state
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            setLoadingState(false);
        }
    });
});
