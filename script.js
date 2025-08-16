// Mediator Platform JS - Client & Freelancer roles with localStorage persistence

// Reference UI elements from DOM
const roleSelection = document.getElementById('role-selection');  // Initial role chooser
const clientBtn = document.getElementById('client-btn');          // Client role button
const freelancerBtn = document.getElementById('freelancer-btn');  // Freelancer role button
const clientSection = document.getElementById('client-section');  // Client project posting section
const freelancerSection = document.getElementById('freelancer-section');  // Freelancer project viewing section

const projectForm = document.getElementById('project-form');      // Client's project posting form
const clientProjectsDiv = document.getElementById('client-projects');   // Where client projects show
const openProjectsDiv = document.getElementById('open-projects');        // Freelancer project list
const freelancerProposalsDiv = document.getElementById('freelancer-proposals');  // Freelancer proposals list

const helpBtn = document.getElementById('help-btn');  // Floating Help button
const helpModal = document.getElementById('help-modal');  // Help modal container
const closeModal = document.getElementById('close-modal'); // Modal close button
const contactForm = document.getElementById('contact-form'); // Contact us form inside modal
const contactFeedback = document.getElementById('contact-feedback'); // Feedback div for contact form messages

// Current user role & data arrays in memory
let currentRole = null;          // 'client' or 'freelancer' when role selected
let clientProjects = [];         // Array of project objects posted by clients
let freelancerProposals = [];    // Array of freelancer proposals made

// Load saved projects & proposals from localStorage on page load 
function loadData() {
  clientProjects = JSON.parse(localStorage.getItem('clientProjects')) || [];
  freelancerProposals = JSON.parse(localStorage.getItem('freelancerProposals')) || [];
}

// Save current projects & proposals data back to localStorage
function saveData() {
  localStorage.setItem('clientProjects', JSON.stringify(clientProjects));
  localStorage.setItem('freelancerProposals', JSON.stringify(freelancerProposals));
}

// When user clicks Client button — show client UI, hide role selector & scroll to top
clientBtn.onclick = () => {
  currentRole = 'client';
  roleSelection.classList.add('hidden');
  clientSection.classList.remove('hidden');
  window.scrollTo(0, 0);
  renderClientProjects();
};

// When user clicks Freelancer button — show freelancer UI, hide role selector & scroll to top
freelancerBtn.onclick = () => {
  currentRole = 'freelancer';
  roleSelection.classList.add('hidden');
  freelancerSection.classList.remove('hidden');
  window.scrollTo(0, 0);
  renderOpenProjects();
  renderFreelancerProposals();
};

// Handle new project submission by client
projectForm.onsubmit = e => {
  e.preventDefault();

  // Get trimmed values from inputs
  const title = document.getElementById('project-title').value.trim();
  const desc = document.getElementById('project-desc').value.trim();
  const budget = parseFloat(document.getElementById('project-budget').value);

  // Validate input
  if (!title || !desc || isNaN(budget) || budget <= 0) {
    alert('Fill all fields correctly.');
    return;
  }

  // Create project object with unique timestamp id
  const newProject = {
    id: Date.now(),
    title,
    desc,
    budget,
    status: 'open',
    proposals: []
  };

  // Add and save
  clientProjects.push(newProject);
  saveData();

  // Update projects list and reset form inputs
  renderClientProjects();
  projectForm.reset();
};

// Render all projects posted by client user with proposals and acceptance buttons
function renderClientProjects() {
  clientProjectsDiv.innerHTML = '';

  if (clientProjects.length === 0) {
    clientProjectsDiv.innerHTML = `<p style="color:#667; margin-top:10px;">No projects posted yet.</p>`;
    return;
  }

  // Show projects newest first
  clientProjects.slice().reverse().forEach(proj => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="project-title">${proj.title}</div>
      <div class="project-desc">${proj.desc}</div>
      <div class="project-budget">Budget: ₹${proj.budget}</div>
      <div class="status status-${proj.status.replace('_','-')}">Status: ${proj.status}</div>
      <h4 style="margin:9px 0 0 0;">Proposals (${proj.proposals.length}):</h4>
    `;

    // List of proposals or show message if none
    if (proj.proposals.length === 0) {
      const p = document.createElement('p');
      p.textContent = 'No proposals yet.';
      card.appendChild(p);
    } else {
      proj.proposals.forEach((prop) => {
        const propDiv = document.createElement('div');
        propDiv.className = 'proposal-card';
        propDiv.innerHTML = `
          <div style="font-weight:500; margin-bottom:6px;">
            <span style="color:#1976d2;">Freelancer:</span> ${prop.name}
          </div>
          <div><span style="color:#666;">Message:</span> ${prop.message}</div>
          <button class="proposal-btn">${proj.status === 'open' ? 'Accept Proposal' : 'Accepted'}</button>
        `;

        const btn = propDiv.querySelector('button');
        if (proj.status !== 'open') btn.disabled = true;

        btn.onclick = () => {
          // Accept this proposal — update project status and save
          proj.status = 'assigned';
          proj.assignedTo = prop.name;
          saveData();
          // Refresh all views to reflect changes
          renderClientProjects();
          renderOpenProjects();
          renderFreelancerProposals();
        };

        card.appendChild(propDiv);
      });
    }

    clientProjectsDiv.appendChild(card);
  });
}

// Show freelancer all open projects available to send proposals to
function renderOpenProjects() {
  openProjectsDiv.innerHTML = '';
  const openProjects = clientProjects.filter(p => p.status === 'open');

  if (openProjects.length === 0) {
    openProjectsDiv.innerHTML = `<p style="color:#667; margin-top:10px;">No open projects currently.</p>`;
    return;
  }

  openProjects.slice().reverse().forEach(proj => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="project-title">${proj.title}</div>
      <div class="project-desc">${proj.desc}</div>
      <div class="project-budget">Budget: ₹${proj.budget}</div>
    `;

    // Button to send proposal
    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply';
    applyBtn.className = 'proposal-btn';
    applyBtn.onclick = () => {
      const freelancerName = prompt('Enter your name:');
      const message = prompt('Enter your proposal message:');
      if (!freelancerName || !message) return alert('Name and message required.');

      // Add proposal to project and freelancer's proposals list
      proj.proposals.push({ name: freelancerName, message });
      freelancerProposals.push({ projectId: proj.id, name: freelancerName, message });

      saveData();
      renderOpenProjects();
      renderClientProjects();
      renderFreelancerProposals();
    };

    card.appendChild(applyBtn);
    openProjectsDiv.appendChild(card);
  });
}

// List all proposals sent by freelancer with project status info
function renderFreelancerProposals() {
  freelancerProposalsDiv.innerHTML = '';
  if (freelancerProposals.length === 0) {
    freelancerProposalsDiv.innerHTML = `<p style="color:#667; margin-top:10px;">You haven't sent any proposals yet.</p>`;
    return;
  }

  freelancerProposals.slice().reverse().forEach(prop => {
    const proj = clientProjects.find(p => p.id === prop.projectId);
    const card = document.createElement('div');
    card.className = 'proposal-card';
    card.innerHTML = `
      <div style="font-weight:500; margin-bottom:6px;">
        <span style="color:#1976d2;">Project:</span> ${proj?.title || 'Unknown'}
      </div>
      <div><span style="color:#666;">Message:</span> ${prop.message}</div>
      <div class="status status-${proj?.status?.replace('_','-') || 'open'}">Status: ${proj?.status || 'open'}</div>
    `;
    freelancerProposalsDiv.appendChild(card);
  });
}

// HELP MODAL HANDLERS

// Open help modal when button clicked
helpBtn.onclick = () => {
  helpModal.classList.remove('hidden');
  contactFeedback.textContent = '';
  contactForm.reset();
};

// Close modal when close icon clicked
closeModal.onclick = () => {
  helpModal.classList.add('hidden');
};

// Close modal if click outside modal content
window.onclick = (e) => {
  if (e.target === helpModal) {
    helpModal.classList.add('hidden');
  }
};

// Contact form submit event (simulated send)
contactForm.onsubmit = e => {
  e.preventDefault();

  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const message = document.getElementById('contact-message').value.trim();

  // Simple client-side validation
  if (!name || !email || !message) {
    contactFeedback.style.color = 'red';
    contactFeedback.textContent = 'Please fill all fields correctly.';
    return;
  }

  // Simulate successful submission
  contactFeedback.style.color = '#2d7a3e';
  contactFeedback.textContent = 'Thank you for contacting us! We will get back to you soon.';
  contactForm.reset();
};

// Load saved project/proposal data on page load
loadData();
