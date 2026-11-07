const membersUrl = "data/members.json";
const businessList = document.querySelector("#business-list");
const resultsCount = document.querySelector("#results-count");
const searchInput = document.querySelector("#business-search");
const categoryFilter = document.querySelector("#category-filter");
const ageFilter = document.querySelector("#age-filter");
const gridButton = document.querySelector("#grid-view");
const listButton = document.querySelector("#list-view");
const menuToggle = document.querySelector("#menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

let members = [];
let currentView = "grid";

async function getMembers() {
  try {
    const response = await fetch(membersUrl);
    if (!response.ok) {
      throw new Error(`Could not load members: ${response.status}`);
    }
    members = await response.json();
    displayMembers();
  } catch (error) {
    businessList.innerHTML = '<p class="error-message">The business directory could not be loaded. Please run this page using VS Code Live Server and check the browser console.</p>';
    resultsCount.textContent = "Unable to load businesses";
    console.error(error);
  }
}

function createMemberCard(member) {
  const card = document.createElement("article");
  card.className = "business-card";

  const header = document.createElement("div");
  header.className = "business-card-header";
  const title = document.createElement("h3");
  title.textContent = member.name;
  const tagline = document.createElement("p");
  tagline.className = "business-tagline";
  tagline.textContent = member.tagline;
  header.append(title, tagline);

  const content = document.createElement("div");
  content.className = "business-card-content";
  const imageSpace = document.createElement("div");
  imageSpace.className = "business-image-placeholder";

  if (member.image) {
    const businessImage = document.createElement("img");
    businessImage.className = "business-image";
    businessImage.src = `images/${member.image}`;
    businessImage.alt = `${member.name} business premises`;
    businessImage.loading = "lazy";
    businessImage.addEventListener("error", () => {
      imageSpace.classList.add("image-missing");
      imageSpace.textContent = `Image not found: ${member.image}`;
    }, { once: true });
    imageSpace.append(businessImage);
  } else {
    imageSpace.classList.add("image-missing");
    imageSpace.textContent = "Business image coming soon";
  }

  const details = document.createElement("div");
  details.className = "business-details";
  details.innerHTML = `
    <p><strong>Category:</strong> ${escapeHTML(member.category)}</p>
    <p><strong>Address:</strong> ${escapeHTML(member.address)}</p>
    <p><strong>Phone:</strong> <a href="tel:${escapeHTML(member.phone.replace(/[^+\d]/g, ""))}">${escapeHTML(member.phone)}</a></p>
    <p><strong>Website:</strong> <a href="${safeWebsite(member.website)}" target="_blank" rel="noopener noreferrer">Visit website</a></p>
  `;
  content.append(imageSpace, details);

  const description = document.createElement("p");
  description.className = "business-description";
  description.textContent = member.description;

  const badge = document.createElement("span");
  badge.className = "member-badge";
  const levels = { 1: "Member", 2: "Silver Member", 3: "Gold Member" };
  badge.textContent = levels[member.membershipLevel] || "Member";

  card.append(header, content, description, badge);
  return card;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function safeWebsite(value = "") {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

function displayMembers() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const selectedAge = ageFilter.value;

  const filteredMembers = members.filter((member) => {
    const matchesSearch = `${member.name} ${member.category} ${member.tagline} ${member.description}`.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === "all" || member.category === selectedCategory;
    const matchesAge = selectedAge === "all" || member.age === selectedAge;
    return matchesSearch && matchesCategory && matchesAge;
  });

  businessList.replaceChildren();
  businessList.className = `business-list ${currentView}-view`;
  resultsCount.textContent = `${filteredMembers.length} ${filteredMembers.length === 1 ? "business" : "businesses"} found`;

  if (filteredMembers.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "no-results";
    emptyMessage.textContent = "No businesses match your filters. Try changing your search or filter options.";
    businessList.append(emptyMessage);
    return;
  }

  filteredMembers.forEach((member) => businessList.append(createMemberCard(member)));
}

function setView(view) {
  currentView = view;
  const isGrid = view === "grid";
  gridButton.classList.toggle("active", isGrid);
  listButton.classList.toggle("active", !isGrid);
  gridButton.setAttribute("aria-pressed", String(isGrid));
  listButton.setAttribute("aria-pressed", String(!isGrid));
  displayMembers();
}

searchInput.addEventListener("input", displayMembers);
categoryFilter.addEventListener("change", displayMembers);
ageFilter.addEventListener("change", displayMembers);
gridButton.addEventListener("click", () => setView("grid"));
listButton.addEventListener("click", () => setView("list"));

menuToggle.addEventListener("click", () => {
  const isOpen = primaryNav.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
});

// Footer information is generated automatically.
document.querySelector("#current-year").textContent = new Date().getFullYear();
const modifiedDate = new Date(document.lastModified);
document.querySelector("#last-modified").textContent = Number.isNaN(modifiedDate.getTime())
  ? document.lastModified
  : modifiedDate.toLocaleString("en-GB", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

getMembers();
