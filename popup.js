document.addEventListener('DOMContentLoaded', function() {


  // Tool Recommender Elements
  const taskInput = document.getElementById('taskInput');
  const findToolBtn = document.getElementById('findToolBtn');
  const recommendationSection = document.getElementById('recommendationSection');
  const generalToolSection = document.getElementById('generalToolSection');
  const toolName = document.getElementById('toolName');
  const toolDescription = document.getElementById('toolDescription');
  const useToolBtn = document.getElementById('useToolBtn');
  const promptBuilderBtn = document.getElementById('promptBuilderBtn');
  const openPromptBuilderBtn = document.getElementById('openPromptBuilderBtn');
  const statusDiv = document.getElementById('status');
  // const useAIBtn = document.getElementById('useAIBtn');
  


   // Prompt Builder
  const promptBuilderSection = document.getElementById('promptBuilderSection');
  const closePromptBuilder = document.getElementById('closePromptBuilder');
  const templateSelection = document.getElementById('templateSelection');
  const templateForm = document.getElementById('templateForm');
  const generatedPromptSection = document.getElementById('generatedPromptSection');
  const skipTemplateBtn = document.getElementById('skipTemplateBtn');
  const backToTemplatesBtn = document.getElementById('backToTemplatesBtn');
  const generatePromptBtn = document.getElementById('generatePromptBtn');
  const templateTitle = document.getElementById('templateTitle');
  const templateDescription = document.getElementById('templateDescription');
  const templateFields = document.getElementById('templateFields');
  const finalPrompt = document.getElementById('finalPrompt');
  const copyPromptBtn = document.getElementById('copyPromptBtn');
  const editPromptBtn = document.getElementById('editPromptBtn');
  const copyStatus = document.getElementById('copyStatus');

  // State
  let recommendedTool = null;
  let formData = {};
  let selectedTemplate = null;
  let currentGeneratedPrompt = '';

  // Initialise
  loadRecentTask();


  // TOOL REC FUNCTIONS
  // Load tools from JSON
  async function loadTools() {
    try {
      const response = await fetch(chrome.runtime.getURL('tools.json'));
      return await response.json();
    } catch (error) {
      console.error('Error loading tools:', error);
      return { tools: [] };
    }
  }
  // Main function to find best tool
  async function findBestTool() {
    const task = taskInput.value.trim();
    
    if (!task) {
      showStatus('Please describe your task first!', 'error');
      taskInput.focus();
      return;
    }
    
    // Save task
    saveTask(task);
    
    // Show loading status
    showStatus('Finding the best AI tool for your task...', 'info');
    
    try {
      // Load tools from JSON
      const toolsData = await loadTools();
      
      // Find matching tool
      const matchedTool = findMatchingTool(task, toolsData.tools);
      
      // Hide both sections first
      recommendationSection.classList.add('hidden');
      generalToolSection.classList.add('hidden');
      
      if (matchedTool) {
        // Show recommendation
        recommendedTool = matchedTool;
        toolName.textContent = matchedTool.name;
        toolDescription.textContent = matchedTool.description;
        recommendationSection.classList.remove('hidden');
        showStatus(`Found ${matchedTool.name} for your task!`, 'success');
      } else {
        // Show general AI option
        generalToolSection.classList.remove('hidden');
        showStatus('Using general AI tool for your task', 'info');
      }
      
    } catch (error) {
      console.error('Error finding tool:', error);
      showStatus('Error finding tool. Try again.', 'error');
      generalToolSection.classList.remove('hidden');
      recommendationSection.classList.add('hidden');
    }
  }




  // Simple keyword matching for quick recommendations
  function findMatchingTool(task, tools) {
    const taskLower = task.toLowerCase();

    // Define keywords for each tool
    // const keywordMap = {
      
    //   'image': ['image', 'picture', 'photo', 'draw', 'visual', 'graphic', 'art'],
    //   'code': ['code', 'program', 'function', 'algorithm', 'developer', 'software'],
    //   'writing': ['write', 'essay', 'article', 'email', 'content', 'blog', 'text'],
    //   'video': ['video', 'film', 'movie', 'animate', 'animation'],
    //   'audio': ['music', 'audio', 'sound', 'song', 'podcast'],
    //   'data': ['analyze', 'analyse', 'data', 'spreadsheet', 'excel', 'chart']
    // };
    
    for (const tool of tools) {
      // Check categories
      if (tool.categories) {
        for (const category of tool.categories) {
          if (taskLower.includes(category.toLowerCase())) {
            return tool;
          }
        }
      }
      
      // Check tags
      if (tool.tags) {
        for (const tag of tool.tags) {
          if (taskLower.includes(tag.toLowerCase())) {
            return tool;
          }
        }
      }
      
      // Check tool name
      if (taskLower.includes(tool.name.toLowerCase())) {
        return tool;
      }
    }
    
    return null;
  }


 

  function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.classList.remove('hidden');
    
    // Automatically hide non-error messages after 5 seconds
    if (type !== 'error') {
      setTimeout(() => {
        statusDiv.classList.add('hidden');
      }, 5000);
    }
  }

  function saveTask(task) {
  chrome.storage.local.set({ lastTask: task });
  }

  function loadRecentTask() {
  chrome.storage.local.get(['lastTask'], function(result) {
    if (result.lastTask) {
      taskInput.value = result.lastTask;
    }
  });
  }



  // Event Listeners
  findToolBtn.addEventListener('click', findBestTool);
  

  useToolBtn.addEventListener('click', () => {
    if (recommendedTool && recommendedTool.url) {
      chrome.tabs.create({ url: recommendedTool.url });
      window.close();
    }
  });

  promptBuilderBtn.addEventListener('click', () => {
    // Show prompt builder below the recommendation
    promptBuilderSection.classList.remove('hidden');
    templateSelection.classList.remove('hidden');
    templateForm.classList.add('hidden');
    generatedPromptSection.classList.add('hidden');
    
    // Scroll to prompt builder
    promptBuilderSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });


  useGeneralBtn.addEventListener('click', () => {
    const task = taskInput.value.trim();
    if (task) {
      const encodedTask = encodeURIComponent(task);
      chrome.tabs.create({ 
        url: `https://chat.openai.com/?q=${encodedTask}`
      });
    }
    window.close();
  });



  // Save task when typing
  taskInput.addEventListener('input', function() {
    saveTask(this.value);
    // chrome.storage.local.set({ lastTask: this.value });
  });
});


  // PROMPT BUILDER FUNCTIONS 
  
  // Template definitions
  const templates = {
    detailed: {
      title: "Detailed Instruction Template",
      description: "Perfect for complex tasks requiring specific details and structure.",
      fields: [
        {
          id: "objective",
          label: "Main Objective",
          placeholder: "What is the primary goal?",
          required: true
        },
        {
          id: "course",
          label: "Faculty/Course Studying",
          placeholder: "e.g., computer science, humanities, law",
          required: true
        },
        {
          id: "year",
          label: "What year of study are you in?",
          placeholder: "e.g., first year, masters, phd",
          required: true
        },
        {
          id: "requirements",
          label: "Specific Requirements",
          placeholder: "List all specific requirements...",
          type: "textarea",
          required: true
        },
        {
          id: "format",
          label: "Desired Format",
          placeholder: "e.g., bullet points, paragraphs, steps",
          required: false
        },
        {
          id: "tone",
          label: "Tone/Style",
          placeholder: "e.g., professional, casual, academic",
          required: false
        }
      ],
      generatePrompt: (data, task) => {
        let prompt = `Objective: ${data.objective}\n\n`;
        prompt += `For a student studying: ${data.course}\n\n`;
        prompt += `In their: ${data.year} studies\n\n`;
        prompt += `Requirements:\n${data.requirements}\n\n`;
        if (data.format) prompt += `Format: ${data.format}\n`;
        if (data.tone) prompt += `Tone: ${data.tone}\n`;
        prompt += `\nPlease provide a comprehensive response addressing all requirements.`;
        return prompt;
      }
    },
    creative: {
      title: "Creative Generation Template",
      description: "For artistic, writing, or creative content generation.",
      fields: [
        {
          id: "concept",
          label: "Main Concept/Idea",
          placeholder: "Describe the main idea...",
          required: true
        },
        {
          id: "course",
          label: "Faculty/Course Studying",
          placeholder: "e.g., computer science, humanities, law",
          required: true
        },{
          id: "year",
          label: "What year of study are you in?",
          placeholder: "e.g., first year, masters, phd",
          required: true
        },
        {
          id: "style",
          label: "Style/Genre",
          placeholder: "e.g., fantasy, sci-fi, realistic, poetic",
          required: true
        },
        {
          id: "elements",
          label: "Key Elements",
          placeholder: "List important elements to include...",
          type: "textarea",
          required: false
        },
        {
          id: "length",
          label: "Desired Length",
          placeholder: "e.g., short, medium, detailed",
          required: false
        }
      ],
      generatePrompt: (data, task) => {
        let prompt = `Concept: ${data.concept}\n\n`;
        prompt += `Style: ${data.style}\n\n`;
        prompt += `For a student studying: ${data.course}\n\n`;
        prompt += `In their: ${data.year} studies\n\n`;
        if (data.elements) prompt += `Key Elements:\n${data.elements}\n\n`;
        if (data.length) prompt += `Length: ${data.length}\n\n`;
        prompt += `Please create something imaginative and engaging.`;
        return prompt;
      }
    },
    technical: {
      title: "Technical/Code Template",
      description: "For programming, analysis, or technical explanations.",
      fields: [
        {
          id: "problem",
          label: "Problem Statement",
          placeholder: "Describe the technical problem...",
          type: "textarea",
          required: true
        },
        {
          id: "course",
          label: "Faculty/Course Studying",
          placeholder: "e.g., computer science, humanities, law",
          required: true
        },{
          id: "year",
          label: "What year of study are you in?",
          placeholder: "e.g., first year, masters, phd",
          required: true
        },
        {
          id: "language",
          label: "Programming Language/Tools",
          placeholder: "e.g., Python, JavaScript, SQL",
          required: true
        },
        {
          id: "constraints",
          label: "Constraints/Limitations",
          placeholder: "Any specific constraints?",
          required: false
        },
        {
          id: "explanation",
          label: "Explanation Level",
          placeholder: "e.g., beginner, intermediate, expert",
          required: false
        }
      ],
      generatePrompt: (data, task) => {
        let prompt = `Problem:\n${data.problem}\n\n`;
        prompt += `For a student studying: ${data.course}\n\n`;
        prompt += `In their: ${data.year} studies\n\n`;
        prompt += `Language/Tools: ${data.language}\n\n`;
        if (data.constraints) prompt += `Constraints: ${data.constraints}\n`;
        if (data.explanation) prompt += `Explanation Level: ${data.explanation}\n`;
        prompt += `\nPlease provide a clear, well-explained solution.`;
        return prompt;
      }
    },
    simple: {
      title: "Simple Request Template",
      description: "For straightforward tasks without many details.",
      fields: [
        {
          id: "request",
          label: "Your Request Explained:",
          placeholder: "What do you need?",
          type: "textarea",
          required: true
        },
        {
          id: "course",
          label: "Faculty/Course Studying",
          placeholder: "e.g., computer science, humanities, law",
          required: true
        },{
          id: "year",
          label: "What year of study are you in?",
          placeholder: "e.g., first year, masters, phd",
          required: true
        },
        {
          id: "extra",
          label: "Additional Context (Optional)",
          placeholder: "Any extra information?",
          type: "textarea",
          required: false
        }
      ],
      generatePrompt: (data, task) => {
        let prompt = `Request: ${data.request}\n\n`;
        prompt += `For a student studying: ${data.course}\n\n`;
        prompt += `In their: ${data.year} studies\n\n`;
        if (data.extra) prompt += `Additional Context:\n${data.extra}\n\n`;
        prompt += `Please provide a helpful response.`;
        return prompt;
      }
    }
  };
  
  // Template selection
  document.querySelectorAll('.template-option').forEach(option => {
    option.addEventListener('click', function() {
      // Remove selection from all options
      document.querySelectorAll('.template-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      
      // Select this option
      this.classList.add('selected');
      selectedTemplate = this.dataset.template;
      
      // Show template form after a brief delay for visual feedback
      setTimeout(() => {
        openTemplateForm(selectedTemplate);
      }, 300);
    });
  });
  
  function openTemplateForm(templateId) {
    const template = templates[templateId];
    if (!template) return;
    
    selectedTemplate = templateId;
    templateTitle.textContent = template.title;
    templateDescription.textContent = template.description;
    
    // Render form fields
    templateFields.innerHTML = template.fields.map(field => `
      <div class="field-group">
        <label>${field.label}${field.required ? ' *' : ''}</label>
        ${field.type === 'textarea' ? 
          `<textarea id="field-${field.id}" 
                    placeholder="${field.placeholder}"
                    data-id="${field.id}"
                    ${field.required ? 'required' : ''}></textarea>` :
          `<input type="text" id="field-${field.id}" 
                 placeholder="${field.placeholder}"
                 data-id="${field.id}"
                 ${field.required ? 'required' : ''}>`}
      </div>
    `).join('');
    
    // Pre-fill first field with task if it exists
    const task = taskInput.value.trim();
    if (task) {
      const firstField = templateFields.querySelector('textarea, input');
      if (firstField && !firstField.value) {
        firstField.value = task;
      }
    }
    
    // Switch to form view
    templateSelection.classList.add('hidden');
    templateForm.classList.remove('hidden');
    generatedPromptSection.classList.add('hidden');
  }
  
  // Back to templates
  backToTemplatesBtn.addEventListener('click', () => {
    templateForm.classList.add('hidden');
    generatedPromptSection.classList.add('hidden');
    templateSelection.classList.remove('hidden');
    selectedTemplate = null;
  });
  
  // Skip template and use AI directly
  skipTemplateBtn.addEventListener('click', () => {
    const task = taskInput.value.trim();
    if (task) {
      const encodedTask = encodeURIComponent(task);
      chrome.tabs.create({ 
        url: `https://chat.openai.com/?q=${encodedTask}`
      });
    }
    window.close();
  });
  
  // Generate prompt
  generatePromptBtn.addEventListener('click', () => {
    if (!selectedTemplate) return;
    
    // Collect form data
    formData = {};
    const template = templates[selectedTemplate];
    
    // Check required fields
    let hasErrors = false;
    template.fields.forEach(field => {
      const input = document.getElementById(`field-${field.id}`);
      if (input) {
        const value = input.value.trim();
        formData[field.id] = value;
        
        if (field.required && !value) {
          input.style.borderColor = 'red';
          hasErrors = true;
        } else {
          input.style.borderColor = '';
        }
      }
    });
    
    if (hasErrors) {
      showStatus('Please fill in all required fields.', 'error');
      return;
    }
    
    // Generate the prompt
    const task = taskInput.value.trim();
    currentGeneratedPrompt = template.generatePrompt(formData, task);
    finalPrompt.textContent = currentGeneratedPrompt;
    
    // Show generated prompt
    templateForm.classList.add('hidden');
    generatedPromptSection.classList.remove('hidden');
    
    // Scroll to generated prompt
    generatedPromptSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  
  // Copy prompt
  copyPromptBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(currentGeneratedPrompt);
      copyStatus.textContent = '✓ Prompt copied to clipboard!';
      copyStatus.className = 'status success small';
      copyStatus.classList.remove('hidden');
      
      setTimeout(() => {
        copyStatus.classList.add('hidden');
      }, 2000);
    } catch (error) {
      copyStatus.textContent = 'Failed to copy. Please copy manually.';
      copyStatus.className = 'status error small';
      copyStatus.classList.remove('hidden');
    }
  });
  
  // Edit prompt
  editPromptBtn.addEventListener('click', () => {
    generatedPromptSection.classList.add('hidden');
    templateForm.classList.remove('hidden');
  });
  
  // // Use in AI tool
  // useAIBtn.addEventListener('click', () => {
  //   if (recommendedTool && recommendedTool.url) {
  //     // Open recommended tool
  //     chrome.tabs.create({ url: recommendedTool.url });
  //   } else {
  //     // Open ChatGPT with prompt
  //     const encodedPrompt = encodeURIComponent(currentGeneratedPrompt);
  //     chrome.tabs.create({ 
  //       url: `https://chat.openai.com/?q=${encodedPrompt}`
  //     });
  //   }
  //   window.close();
  // });
  
  // Close prompt builder
  closePromptBuilder.addEventListener('click', () => {
    promptBuilderSection.classList.add('hidden');
  });
  
