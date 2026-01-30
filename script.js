const roleSelection = document.getElementById('role-selection');  
const clientBtn = document.getElementById('client-btn');         
const freelancerBtn = document.getElementById('freelancer-btn'); 
const clientSection = document.getElementById('client-section');  
const freelancerSection = document.getElementById('freelancer-section');  

const projectForm = document.getElementById('project-form');      
const clientProjectsDiv = document.getElementById('client-projects');  
const openProjectsDiv = document.getElementById('open-projects');        
const freelancerProposalsDiv = document.getElementById('freelancer-proposals'); 

const helpBtn = document.getElementById('help-btn');  
const helpModal = document.getElementById('help-modal'); 
const closeModal = document.getElementById('close-modal'); 
const contactForm = document.getElementById('contact-form'); 
const contactFeedback = document.getElementById('contact-feedback'); 

let currentRole = null;         
let clientProjects = [];         
let freelancerProposals = [];   

function loadData() {
  clientProjects = JSON.parse(localStorage.getItem('clientProjects')) || [];
  freelancerProposals = JSON.parse(localStorage.getItem('freelancerProposals')) || [];
}

function saveData() {
  localStorage.setItem('clientProjects', JSON.stringify(clientProjects));
  localStorage.setItem('freelancerProposals', JSON.stringify(freelancerProposals));
}

clientBtn.onclick = () => {
  currentRole = 'client';
  roleSelection.classList.add('hidden');
  clientSection.classList.remove('hidden');
  window.scrollTo(0, 0);
  renderClientProjects();
};

freelancerBtn.onclick = () => {
  currentRole = 'freelancer';
  roleSelection.classList.add('hidden');
  freelancerSection.classList.remove('hidden');
  window.scrollTo(0, 0);
  renderOpenProjects();
  renderFreelancerProposals();
};

projectForm.onsubmit = e => {
  e.preventDefault();

  const title = document.getElementById('project-title').value.trim();
  const desc = document.getElementById('project-desc').value.trim();
  const budget = parseFloat(document.getElementById('project-budget').value);

  if (!title || !desc || isNaN(budget) || budget <= 0) {
    alert('Fill all fields correctly.');
    return;
  }

  const newProject = {
    id: Date.now(),
    title,
    desc,
    budget,
    status: 'open',
    proposals: []
  };

  clientProjects.push(newProject);
  saveData();

  renderClientProjects();
  projectForm.reset();
};

function renderClientProjects() {
  clientProjectsDiv.innerHTML = '';

  if (clientProjects.length === 0) {
    clientProjectsDiv.innerHTML = `<p style="color:#667; margin-top:10px;">No projects posted yet.</p>`;
    return;
  }

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
          proj.status = 'assigned';
          proj.assignedTo = prop.name;
          saveData();
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

    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply';
    applyBtn.className = 'proposal-btn';
    applyBtn.onclick = () => {
      const freelancerName = prompt('Enter your name:');
      const message = prompt('Enter your proposal message:');
      if (!freelancerName || !message) return alert('Name and message required.');

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


helpBtn.onclick = () => {
  helpModal.classList.remove('hidden');
  contactFeedback.textContent = '';
  contactForm.reset();
};

closeModal.onclick = () => {
  helpModal.classList.add('hidden');
};

window.onclick = (e) => {
  if (e.target === helpModal) {
    helpModal.classList.add('hidden');
  }
};

contactForm.onsubmit = e => {
  e.preventDefault();

  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const message = document.getElementById('contact-message').value.trim();

  if (!name || !email || !message) {
    contactFeedback.style.color = 'red';
    contactFeedback.textContent = 'Please fill all fields correctly.';
    return;
  }

  contactFeedback.style.color = '#2d7a3e';
  contactFeedback.textContent = 'Thank you for contacting us! We will get back to you soon.';
  contactForm.reset();
};

loadData();
