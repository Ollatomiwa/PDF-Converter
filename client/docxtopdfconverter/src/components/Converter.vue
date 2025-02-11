<template>
    <div class="converter">
      <h1>DOCX to PDF Converter</h1>
      <div class="file-input">
        <input 
          type="file" 
          ref="fileInput"
          @change="handleFileSelect" 
          accept=".docx" 
          :disabled="isLoading"
        />
        <button 
          @click="handleConversion" 
          :disabled="!canConvert || isLoading"
        >
          {{ isLoading ? 'Converting...' : 'Convert to PDF' }}
        </button>
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="statusMessage" :class="statusClass">{{ statusMessage }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import axios from 'axios';
  
  const fileInput = ref(null);
  const selectedFile = ref(null);
  const isLoading = ref(false);
  const errorMessage = ref('');
  const statusMessage = ref('');
  
  const canConvert = computed(() => {
    return selectedFile.value && !isLoading.value;
  });
  
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.docx')) {
      selectedFile.value = file;
      errorMessage.value = '';
      statusMessage.value = `Ready to convert: ${file.name}`;
    } else {
      errorMessage.value = 'Please select a .docx file';
      selectedFile.value = null;
      fileInput.value.value = ''; // Reset file input
    }
  };
  
  const handleConversion = async () => {
    if (!canConvert.value) return;
  
    isLoading.value = true;
    errorMessage.value = '';
    statusMessage.value = 'Starting conversion...';
  
    const formData = new FormData();
    formData.append('file', selectedFile.value);
  
    try {
      const response = await axios.post('http://localhost:3000/convert', formData, {
        responseType: 'blob',
        timeout: 120000 // 120 seconds
      });
  
      statusMessage.value = 'Conversion successful! Downloading...';
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedFile.value.name.replace('.docx', '')}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      statusMessage.value = 'Download completed!';
    } catch (error) {
      errorMessage.value = error.response?.data?.message || 'Conversion failed. Please try again.';
      console.error('Conversion error:', error);
    } finally {
      isLoading.value = false;
    }
  };
  </script>
  
  <style>
  .converter {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    text-align: center;
  }
  
  button {
    background: #42b983;
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  button:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
  
  .error {
    color: #ff4444;
    margin-top: 1rem;
  }
  
  .status {
    color: #42b983;
    margin-top: 1rem;
  }
  </style>