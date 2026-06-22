/* ============================================================
   GLOBAL STATE + DOM CACHE
============================================================ */
const STORAGE_KEY = "portfolioBuilderData";

const state = {
    name: "",
    email: "",
    phone: "",
    jobTitle: "",
    skills: [],
    school: "",
    degree: "",
    gradYear: "",
    summary: "",
    expParagraph: "",
    expBullets: "",
    projects: []
};

const el = {};

function cacheElements() {
    [
        "name","email","phone","jobTitle","school","degree","graduationYear",
        "summary","experienceParagraph","experienceBullets",
        "customSkillInput","suggestedSkillsList","selectedSkillsList",
        "preview","companyName","positionApplying","hiringManager",
        "coverLetterPreview","projectTitle","projectDesc","projectTech",
        "projectLink","projectGithub","projectImage","projectsList",
        "viewName","viewEmail","viewPhone","viewAbout","viewSkills",
        "projectsDisplay","themeSwitcher","sidebarName","sidebarEmail",
        "sidebarPhone","statSkills","statProjects"
    ].forEach(id => el[id] = document.getElementById(id));
}

/* ============================================================
   THEME SYSTEM
============================================================ */
function loadTheme() {
    const saved = localStorage.getItem("selectedTheme") || "midnight";
    document.body.setAttribute("data-theme", saved);
    el.themeSwitcher.value = saved;
}

function changeTheme() {
    const theme = el.themeSwitcher.value;
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("selectedTheme", theme);
}

/* ============================================================
   JOB TITLES + SKILLS
============================================================ */
const jobSkillsMap = {
    "Software Engineer": ["JavaScript", "Python", "Git", "API Development", "Testing", "Debugging", "System Design"],
    "Full Stack Developer": ["JavaScript", "TypeScript", "React", "Node.js", "HTML", "CSS", "REST APIs", "MongoDB"],
    "Frontend Developer": ["JavaScript", "React", "HTML", "CSS", "SASS/SCSS", "Tailwind CSS"],
    "Backend Developer": ["Python", "Java", "Node.js", "Express.js", "SQL", "PostgreSQL", "MongoDB"],
    "Data Analyst": ["SQL", "Python", "Excel", "Tableau", "Power BI", "Data Analysis"],
    "UX/UI Designer": ["UI Design", "UX Design", "Figma", "Adobe XD", "Wireframing", "Prototyping"],
    "Project Manager": ["Agile", "Scrum", "Jira", "Leadership", "Communication", "Risk Management"]
};

const masterSkillsList = [
    "JavaScript", "Python", "Java", "C#", "TypeScript",
    "HTML", "CSS", "React", "Node.js", "SQL", "PostgreSQL", "MongoDB",
    "Git", "REST APIs", "Testing", "Debugging", "System Design",
    "Excel", "Tableau", "Power BI", "Data Analysis",
    "UI Design", "UX Design", "Figma", "Adobe XD",
    "Agile", "Scrum", "Jira", "Leadership", "Communication"
];

function populateJobTitles() {
    const select = el.jobTitle;
    select.innerHTML = `<option value="">-- Select a Job Title --</option>`;
    Object.keys(jobSkillsMap).forEach(title => {
        const opt = document.createElement("option");
        opt.value = title;
        opt.textContent = title;
        select.appendChild(opt);
    });
}

function renderMasterSkillsList() {
    const jobTitle = state.jobTitle;
    const skillsToShow = jobTitle && jobSkillsMap[jobTitle]
        ? jobSkillsMap[jobTitle]
        : masterSkillsList;

    el.suggestedSkillsList.innerHTML = skillsToShow.map(skill => {
        const selected = state.skills.includes(skill);
        return `
            <label class="skill-option" style="
                display:inline-flex;
                align-items:center;
                background:${selected ? 'var(--purple)' : 'rgba(255,255,255,0.05)'};
                color:${selected ? 'white' : 'var(--text)'};
                padding:8px 12px;
                border-radius:20px;
                cursor:pointer;
                margin:4px;
                border:2px solid ${selected ? 'var(--purple)' : 'transparent'};
            ">
                <input type="checkbox" ${selected ? "checked" : ""} data-skill="${skill}" style="margin-right:8px;">
                ${skill}
            </label>
        `;
    }).join("");

    el.suggestedSkillsList.querySelectorAll("input[type='checkbox']").forEach(cb => {
        cb.addEventListener("change", () => toggleSkill(cb.getAttribute("data-skill")));
    });
}

function renderSelectedSkills() {
    el.selectedSkillsList.innerHTML = state.skills.map(skill => `
        <span class="skill-tag">
            ${skill}
            <button data-remove-skill="${skill}" class="remove-skill-btn">×</button>
        </span>
    `).join("");

    el.selectedSkillsList.querySelectorAll("button[data-remove-skill]").forEach(btn => {
        btn.addEventListener("click", () => removeSkill(btn.getAttribute("data-remove-skill")));
    });

    updateSidebarStats();
}

function toggleSkill(skill) {
    const i = state.skills.indexOf(skill);
    if (i >= 0) state.skills.splice(i, 1);
    else state.skills.push(skill);

    saveState();
    renderMasterSkillsList();
    renderSelectedSkills();
    renderResumePreview();
    updateWebsiteView();
}

function addCustomSkill() {
    const skill = el.customSkillInput.value.trim();
    if (!skill) return;
    if (!state.skills.includes(skill)) state.skills.push(skill);
    el.customSkillInput.value = "";
    saveState();
    renderSelectedSkills();
    renderMasterSkillsList();
    renderResumePreview();
    updateWebsiteView();
}

function removeSkill(skill) {
    state.skills = state.skills.filter(s => s !== skill);
    saveState();
    renderSelectedSkills();
    renderMasterSkillsList();
    renderResumePreview();
    updateWebsiteView();
}

/* ============================================================
   PHONE FORMATTER
============================================================ */
function formatPhoneNumber() {
    let value = el.phone.value.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10);

    if (value.length >= 6) {
        el.phone.value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
    } else if (value.length >= 3) {
        el.phone.value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else {
        el.phone.value = value;
    }

    state.phone = el.phone.value;
    saveState();
    renderResumePreview();
    updateWebsiteView();
}

/* ============================================================
   AI ENHANCEMENT BUTTONS
============================================================ */
function enhanceSummary() {
    let text = el.summary.value.trim();
    if (!text) return;
    text = text.charAt(0).toUpperCase() + text.slice(1);
    if (!/[.!?]$/.test(text)) text += ".";
    el.summary.value = text;
    state.summary = text;
    saveState();
    renderResumePreview();
    updateWebsiteView();
}

function enhanceBullets() {
    let lines = el.experienceBullets.value.split("\n").map(l => l.trim()).filter(l => l);
    lines = lines.map(line => {
        let t = line.charAt(0).toUpperCase() + line.slice(1);
        if (!/[.!?]$/.test(t)) t += ".";
        return t;
    });
    el.experienceBullets.value = lines.join("\n");
    state.expBullets = el.experienceBullets.value;
    saveState();
    renderResumePreview();
}

/* ============================================================
   RESUME PREVIEW
============================================================ */
function renderResumePreview() {
    const name = state.name || "Your Name";
    const email = state.email || "";
    const phone = state.phone || "";
    const jobTitle = state.jobTitle || "";
    const summary = state.summary || "";
    const expParagraph = state.expParagraph || "";
    const expBullets = (state.expBullets || "").split("\n").map(l => l.trim()).filter(l => l);
    const school = state.school || "";
    const degree = state.degree || "";
    const gradYear = state.gradYear || "";

    el.preview.innerHTML = `
        <h1>${name}</h1>
        <p>${email} • ${phone}</p>
        ${jobTitle ? `<p style="color:var(--purple);font-weight:bold;">${jobTitle}</p>` : ""}
        
        ${summary ? `<h3>PROFESSIONAL SUMMARY</h3><p>${summary}</p>` : ""}
        
        ${(expParagraph || expBullets.length) ? `<h3>EXPERIENCE</h3>` : ""}
        ${expParagraph ? `<p>${expParagraph}</p>` : ""}
        ${expBullets.length ? `<ul>${expBullets.map(b => `<li>${b}</li>`).join("")}</ul>` : ""}
        
        ${state.skills.length ? `<h3>SKILLS</h3>${state.skills.map(s => `<span class="skill-tag">${s}</span>`).join("")}` : ""}
        
        ${(degree || school) ? `<h3>EDUCATION</h3><p><strong>${degree}</strong><br>${school} ${gradYear ? `(${gradYear})` : ""}</p>` : ""}
    `;

    updateSidebarInfo();
}

/* ============================================================
   DOCX EXPORT — RESUME
============================================================ */
async function downloadResumeDOCX() {
    if (!window.docx) return alert("DOCX library not loaded.");

    const { Document, Packer, Paragraph, TextRun } = docx;

    const expBullets = (state.expBullets || "").split("\n").map(l => l.trim()).filter(l => l);
    const children = [];

    children.push(new Paragraph({
        children: [new TextRun({ text: (state.name || "Your Name").toUpperCase(), bold: true, size: 36 })]
    }));
    children.push(new Paragraph(`${state.email || ""} • ${state.phone || ""}`));
    if (state.jobTitle) {
        children.push(new Paragraph({ children: [new TextRun({ text: state.jobTitle, bold: true })] }));
    }
    children.push(new Paragraph(""));

    if (state.summary) {
        children.push(new Paragraph({ children: [new TextRun({ text: "PROFESSIONAL SUMMARY", bold: true, size: 28 })] }));
        children.push(new Paragraph(state.summary));
        children.push(new Paragraph(""));
    }

    if (state.skills.length) {
        children.push(new Paragraph({ children: [new TextRun({ text: "SKILLS", bold: true, size: 28 })] }));
        children.push(new Paragraph(state.skills.join(", ")));
        children.push(new Paragraph(""));
    }

    if (state.expParagraph || expBullets.length) {
        children.push(new Paragraph({ children: [new TextRun({ text: "EXPERIENCE", bold: true, size: 28 })] }));
        if (state.expParagraph) children.push(new Paragraph(state.expParagraph));
        expBullets.forEach(b => {
            children.push(new Paragraph({
                children: [
                    new TextRun({ text: "• ", bold: true }),
                    new TextRun({ text: b })
                ]
            }));
        });
        children.push(new Paragraph(""));
    }

    if (state.degree || state.school) {
        children.push(new Paragraph({ children: [new TextRun({ text: "EDUCATION", bold: true, size: 28 })] }));
        let eduLine = "";
        if (state.degree) eduLine += state.degree;
        if (state.school) eduLine += `\n${state.school}`;
        if (state.gradYear) eduLine += ` (${state.gradYear})`;
        children.push(new Paragraph(eduLine));
        children.push(new Paragraph(""));
    }

    if (state.projects.length) {
        children.push(new Paragraph({ children: [new TextRun({ text: "PROJECTS", bold: true, size: 28 })] }));
        state.projects.forEach(p => {
            const tech = (p.technologies || []).join(", ");
            children.push(new Paragraph(`${p.title} — ${tech}`));
        });
        children.push(new Paragraph(""));
    }

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resume.docx";
    link.click();
}

function downloadResumeJSON() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resume-data.json";
    link.click();
}

/* ============================================================
   COVER LETTER
============================================================ */
function generateCoverLetter() {
    const name = state.name || "Your Name";
    const email = state.email || "";
    const phone = state.phone || "";
    const company = el.companyName.value || "Company";
    const position = el.positionApplying.value || "Position";
    const manager = el.hiringManager.value || "Hiring Manager";
    const summary = state.summary || "";
    const skills = state.skills.slice(0, 5).join(", ") || "relevant skills";

    const text = `Dear ${manager},

I am writing to express my interest in the ${position} position at ${company}. My background in ${skills} makes me confident in my ability to contribute effectively.

${summary}

Thank you for your consideration.

Sincerely,
${name}
${email} • ${phone}`;

    el.coverLetterPreview.textContent = text;
}

async function downloadCoverLetterDOCX() {
    if (!window.docx) return alert("DOCX library not loaded.");
    const { Document, Packer, Paragraph } = docx;

    const text = el.coverLetterPreview.textContent || "";
    const doc = new Document({
        sections: [{ children: text.split("\n").map(line => new Paragraph(line)) }]
    });

    const blob = await Packer.toBlob(doc);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cover-letter.docx";
    link.click();
}

/* ============================================================
   PORTFOLIO
============================================================ */
function addProject() {
    const title = el.projectTitle.value.trim();
    if (!title) return alert("Project needs a title.");

    const project = {
        id: Date.now(),
        title,
        description: el.projectDesc.value.trim(),
        technologies: el.projectTech.value.split(",").map(t => t.trim()).filter(t => t),
        link: el.projectLink.value.trim(),
        github: el.projectGithub.value.trim(),
        image: el.projectImage.value.trim()
    };

    state.projects.push(project);
    saveState();
    renderProjects();
    updateWebsiteView();

    el.projectTitle.value = "";
    el.projectDesc.value = "";
    el.projectTech.value = "";
    el.projectLink.value = "";
    el.projectGithub.value = "";
    el.projectImage.value = "";

    updateSidebarStats();
}

function removeProject(id) {
    state.projects = state.projects.filter(p => p.id !== id);
    saveState();
    renderProjects();
    updateWebsiteView();
    updateSidebarStats();
}

function renderProjects() {
    const projects = state.projects || [];
    if (!projects.length) {
        el.projectsList.innerHTML = "<p>No projects yet.</p>";
        return;
    }

    el.projectsList.innerHTML = projects.map(p => `
        <div class="project-card">
            ${p.image ? `<img src="${p.image}" alt="${p.title}">` : ""}
            <h3>${p.title}</h3>
            <p>${p.description || ""}</p>
            <div>${(p.technologies || []).map(t => `<span class="skill-tag">${t}</span>`).join("")}</div>
            <div style="margin-top:10px;">
                ${p.link ? `<a href="${p.link}" target="_blank" class="btn">Live</a>` : ""}
                ${p.github ? `<a href="${p.github}" target="_blank" class="btn">GitHub</a>` : ""}
                <button class="btn" style="background:#b3003c;" data-remove-project="${p.id}">Remove</button>
            </div>
        </div>
    `).join("");

    el.projectsList.querySelectorAll("button[data-remove-project]").forEach(btn => {
        btn.addEventListener("click", () => removeProject(Number(btn.getAttribute("data-remove-project"))));
    });
}

/* ============================================================
   WEBSITE VIEW
============================================================ */
function updateWebsiteView() {
    el.viewName.textContent = state.name || "Your Name";
    el.viewEmail.textContent = state.email || "";
    el.viewPhone.textContent = state.phone || "";
    el.viewAbout.textContent = state.summary || "";

    el.viewSkills.innerHTML = state.skills.map(s => `<span class="skill-tag">${s}</span>`).join("");

    const projects = state.projects || [];
    if (!projects.length) {
        el.projectsDisplay.innerHTML = "<p>No projects added yet.</p>";
        return;
    }

    el.projectsDisplay.innerHTML = projects.map(p => `
        <div class="project-card">
            ${p.image ? `<img src="${p.image}" alt="${p.title}">` : ""}
            <h3>${p.title}</h3>
            <p>${p.description || ""}</p>
            <div>${(p.technologies || []).map(t => `<span class="skill-tag">${t}</span>`).join("")}</div>
            <div style="margin-top:10px;">
                ${p.link ? `<a href="${p.link}" target="_blank" class="btn">Live</a>` : ""}
                ${p.github ? `<a href="${p.github}" target="_blank" class="btn">GitHub</a>` : ""}
            </div>
        </div>
    `).join("");
}

/* ============================================================
   SIDEBAR INFO + STATS
============================================================ */
function updateSidebarInfo() {
    el.sidebarName.textContent = state.name
}function updateSidebarInfo() {
    el.sidebarName.textContent = state.name || "Your Name";
    el.sidebarEmail.textContent = state.email || "";
    el.sidebarPhone.textContent = state.phone || "";
}

function updateSidebarStats() {
    el.statSkills.textContent = state.skills.length;
    el.statProjects.textContent = state.projects.length;
}

/* ============================================================
   SAVE + LOAD STATE
============================================================ */
function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    Object.assign(state, data);

    el.name.value = state.name || "";
    el.email.value = state.email || "";
    el.phone.value = state.phone || "";
    el.jobTitle.value = state.jobTitle || "";
    el.school.value = state.school || "";
    el.degree.value = state.degree || "";
    el.graduationYear.value = state.gradYear || "";
    el.summary.value = state.summary || "";
    el.experienceParagraph.value = state.expParagraph || "";
    el.experienceBullets.value = state.expBullets || "";
}

/* ============================================================
   TAB SWITCHING
============================================================ */
function switchTab(tab) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.getElementById(tab + "Tab").classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(btn =>
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tab)
    );

    if (tab === "coverLetter") generateCoverLetter();
    if (tab === "website") updateWebsiteView();
}

/* ============================================================
   INITIALIZATION
============================================================ */
window.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    loadTheme();
    populateJobTitles();
    loadState();

    // Sync inputs
    el.name.addEventListener("input", e => { state.name = e.target.value; saveState(); renderResumePreview(); updateWebsiteView(); updateSidebarInfo(); });
    el.email.addEventListener("input", e => { state.email = e.target.value; saveState(); renderResumePreview(); updateWebsiteView(); updateSidebarInfo(); });
    el.phone.addEventListener("input", formatPhoneNumber);

    el.jobTitle.addEventListener("change", e => {
        state.jobTitle = e.target.value;
        if (jobSkillsMap[state.jobTitle]) {
            state.skills = Array.from(new Set([...state.skills, ...jobSkillsMap[state.jobTitle]]));
        }
        saveState();
        renderMasterSkillsList();
        renderSelectedSkills();
        renderResumePreview();
        updateWebsiteView();
    });

    el.school.addEventListener("input", e => { state.school = e.target.value; saveState(); renderResumePreview(); });
    el.degree.addEventListener("input", e => { state.degree = e.target.value; saveState(); renderResumePreview(); });
    el.graduationYear.addEventListener("input", e => { state.gradYear = e.target.value; saveState(); renderResumePreview(); });

    el.summary.addEventListener("input", e => { state.summary = e.target.value; saveState(); renderResumePreview(); updateWebsiteView(); });
    el.experienceParagraph.addEventListener("input", e => { state.expParagraph = e.target.value; saveState(); renderResumePreview(); });
    el.experienceBullets.addEventListener("input", e => { state.expBullets = e.target.value; saveState(); renderResumePreview(); });

    // Buttons
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", () => switchTab(btn.getAttribute("data-tab")));
    });

    el.themeSwitcher.addEventListener("change", changeTheme);
    document.getElementById("addCustomSkillBtn").addEventListener("click", addCustomSkill);
    document.getElementById("enhanceSummaryBtn").addEventListener("click", enhanceSummary);
    document.getElementById("enhanceBulletsBtn").addEventListener("click", enhanceBullets);
    document.getElementById("updatePreviewBtn").addEventListener("click", renderResumePreview);
    document.getElementById("downloadResumeDOCXBtn").addEventListener("click", downloadResumeDOCX);
    document.getElementById("downloadResumeJSONBtn").addEventListener("click", downloadResumeJSON);
    document.getElementById("generateCoverLetterBtn").addEventListener("click", generateCoverLetter);
    document.getElementById("downloadCoverLetterDOCXBtn").addEventListener("click", downloadCoverLetterDOCX);
    document.getElementById("addProjectBtn").addEventListener("click", addProject);

    // Quick actions
    document.getElementById("quickDownloadResume").addEventListener("click", downloadResumeDOCX);
    document.getElementById("quickDownloadPortfolio").addEventListener("click", downloadResumeJSON);

    // Initial renders
    renderMasterSkillsList();
    renderSelectedSkills();
    renderProjects();
    renderResumePreview();
    updateWebsiteView();
    updateSidebarInfo();
    updateSidebarStats();
});
